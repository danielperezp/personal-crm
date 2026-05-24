import { Router } from 'express';
import type { ICommandBus } from '../../../application/commands/bus/ICommandBus.js';
import type { IQueryBus } from '../../../application/queries/bus/IQueryBus.js';
import type { IEventStore } from '../../../application/ports/IEventStore.js';
import type { FirebaseAuthMiddleware } from '../../auth/FirebaseAuthMiddleware.js';
import { requirePermission } from '../../auth/PermissionGuard.js';
import { UserController } from '../controllers/UserController.js';

export function createUserRouter(
  commandBus: ICommandBus,
  queryBus: IQueryBus,
  eventStore: IEventStore,
  authMiddleware: FirebaseAuthMiddleware,
): Router {
  const router = Router();
  const ctrl = new UserController(commandBus, queryBus, eventStore);
  const auth = authMiddleware.middleware();

  // Commands (public route for first registration)
  router.post('/commands/RegisterUser', ctrl.registerUser);
  router.post('/commands/UpdateUser', auth, ctrl.updateUser);
  router.post('/commands/ChangeUserRole', auth, requirePermission('users:manage'), ctrl.changeUserRole);
  router.post('/commands/UpdateUserPermissions', auth, requirePermission('users:manage'), ctrl.updateUserPermissions);
  router.post('/commands/SuspendUser', auth, requirePermission('users:manage'), ctrl.suspendUser);
  router.post('/commands/ReactivateUser', auth, requirePermission('users:manage'), ctrl.reactivateUser);
  router.post('/commands/DeactivateUser', auth, requirePermission('users:manage'), ctrl.deactivateUser);
  router.post('/commands/UpdateUserPreferences', auth, ctrl.updateUserPreferences);

  // Queries
  router.get('/', auth, requirePermission('users:manage'), ctrl.getUserList);
  router.get('/me', auth, ctrl.getCurrentUser);
  router.get('/:id', auth, requirePermission('users:manage'), ctrl.getUserDetail);
  router.get('/:id/events', auth, requirePermission('events:replay'), ctrl.getUserEvents);

  return router;
}
