import type { Request, Response, NextFunction } from 'express';
import type { ICommandBus } from '../../../application/commands/bus/ICommandBus.js';
import type { IQueryBus } from '../../../application/queries/bus/IQueryBus.js';
import type { IEventStore } from '../../../application/ports/IEventStore.js';
import { randomUUID } from 'crypto';

export class UserController {
  constructor(
    private readonly commandBus: ICommandBus,
    private readonly queryBus: IQueryBus,
    private readonly eventStore: IEventStore,
  ) {}

  private metadata(req: Request) {
    return {
      commandId: randomUUID(),
      userId: req.user?.userId ?? 'system',
      correlationId: req.correlationId,
      timestamp: Date.now(),
    };
  }

  registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.commandBus.execute({
        type: 'RegisterUser',
        payload: req.body,
        metadata: this.metadata(req),
      });
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) { next(err); }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.commandBus.execute({ type: 'UpdateUser', payload: req.body, metadata: this.metadata(req) });
      res.status(200).json({ message: 'User updated' });
    } catch (err) { next(err); }
  };

  changeUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.commandBus.execute({ type: 'ChangeUserRole', payload: req.body, metadata: this.metadata(req) });
      res.status(200).json({ message: 'User role changed' });
    } catch (err) { next(err); }
  };

  updateUserPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.commandBus.execute({ type: 'UpdateUserPermissions', payload: req.body, metadata: this.metadata(req) });
      res.status(200).json({ message: 'Permissions updated' });
    } catch (err) { next(err); }
  };

  suspendUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.commandBus.execute({ type: 'SuspendUser', payload: req.body, metadata: this.metadata(req) });
      res.status(200).json({ message: 'User suspended' });
    } catch (err) { next(err); }
  };

  reactivateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.commandBus.execute({ type: 'ReactivateUser', payload: req.body, metadata: this.metadata(req) });
      res.status(200).json({ message: 'User reactivated' });
    } catch (err) { next(err); }
  };

  deactivateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.commandBus.execute({ type: 'DeactivateUser', payload: req.body, metadata: this.metadata(req) });
      res.status(200).json({ message: 'User deactivated' });
    } catch (err) { next(err); }
  };

  updateUserPreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.commandBus.execute({ type: 'UpdateUserPreferences', payload: req.body, metadata: this.metadata(req) });
      res.status(200).json({ message: 'Preferences updated' });
    } catch (err) { next(err); }
  };

  getUserList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.queryBus.execute({
        type: 'GetUserList',
        payload: {
          role: req.query.role as string | undefined,
          status: req.query.status as string | undefined,
          page: req.query.page ? Number(req.query.page) : 1,
          limit: req.query.limit ? Number(req.query.limit) : 20,
        },
      });
      res.status(200).json(result);
    } catch (err) { next(err); }
  };

  getUserDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.queryBus.execute({ type: 'GetUserDetail', payload: { userId: req.params.id } });
      res.status(200).json(result);
    } catch (err) { next(err); }
  };

  getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
      const result = await this.queryBus.execute({ type: 'GetUserDetail', payload: { userId: req.user.userId } });
      res.status(200).json(result);
    } catch (err) { next(err); }
  };

  getUserEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const events = await this.eventStore.load(req.params.id);
      res.status(200).json({ data: events });
    } catch (err) { next(err); }
  };
}
