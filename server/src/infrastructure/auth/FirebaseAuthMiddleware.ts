import type { Request, Response, NextFunction } from 'express';
import type { Auth } from 'firebase-admin/auth';
import type { ICommandBus } from '../../application/commands/bus/ICommandBus.js';
import type { IReadModelRepository } from '../../application/ports/IReadModelRepository.js';
import { UnauthorizedError, ForbiddenError } from '../../domain/shared/DomainError.js';
import type { UserRole, UserStatus } from '@nexus/shared';

const PUBLIC_PATHS = ['/api/v1/health', '/api/v1/users/commands/RegisterUser'];

interface UserContext {
  userId: string;
  firebaseUid: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  permissions: string[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserContext;
    }
  }
}

interface FirebaseUidLookup {
  userId: string;
}

interface UserReadModel {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  permissions: string[];
}

export class FirebaseAuthMiddleware {
  constructor(
    private readonly auth: Auth,
    private readonly readModelRepo: IReadModelRepository,
    private readonly commandBus: ICommandBus,
  ) {}

  middleware() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (PUBLIC_PATHS.includes(req.path)) {
        next();
        return;
      }

      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        next(new UnauthorizedError('Missing or invalid authorization header'));
        return;
      }

      const token = authHeader.split(' ')[1];
      try {
        const decoded = await this.auth.verifyIdToken(token);

        // Look up userId via secondary index
        const lookup = await this.readModelRepo.findById<FirebaseUidLookup>(
          'rm_users_by_firebase_uid',
          decoded.uid,
        );

        if (!lookup) {
          // User hasn't registered yet — allow RegisterUser but reject others
          next(new UnauthorizedError('User not found. Please register first.'));
          return;
        }

        // Fetch full user context
        const userReadModel = await this.readModelRepo.findById<UserReadModel>(
          'rm_users',
          lookup.userId,
        );

        if (!userReadModel) {
          next(new UnauthorizedError('User read model not found'));
          return;
        }

        if (userReadModel.status === 'Suspended' || userReadModel.status === 'Deactivated') {
          next(new ForbiddenError(`Account is ${userReadModel.status}`));
          return;
        }

        req.user = {
          userId: lookup.userId,
          firebaseUid: decoded.uid,
          email: decoded.email ?? '',
          role: userReadModel.role,
          status: userReadModel.status,
          permissions: userReadModel.permissions,
        };

        // Record login asynchronously (fire and forget for latency)
        this.commandBus.execute({
          type: 'RecordLogin',
          payload: { userId: lookup.userId, loginTimestamp: Date.now() },
          metadata: {
            commandId: req.correlationId,
            userId: lookup.userId,
            correlationId: req.correlationId,
            timestamp: Date.now(),
          },
        }).catch(err => {
          console.error('RecordLogin failed:', err);
        });

        next();
      } catch (err) {
        next(new UnauthorizedError('Invalid or expired token'));
      }
    };
  }
}
