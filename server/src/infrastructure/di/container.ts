import { getFirestoreDb, getFirebaseAuth, getFirebaseStorage } from '../firebase/firebaseAdmin.js';
import { FirestoreEventStore } from '../firebase/FirestoreEventStore.js';
import { FirestoreReadModelRepo } from '../firebase/FirestoreReadModelRepo.js';
import { FirebaseStorageAdapter } from '../firebase/FirebaseStorageAdapter.js';
import { FirestoreBootstrapRepository } from '../firebase/FirestoreBootstrapRepository.js';
import { InProcessCommandBus } from '../../application/commands/bus/InProcessCommandBus.js';
import { InProcessQueryBus } from '../../application/queries/bus/InProcessQueryBus.js';
import { InProcessEventBus } from '../../application/events/bus/InProcessEventBus.js';
import { ProjectionEngine } from '../projections/ProjectionEngine.js';
import { FirebaseAuthMiddleware } from '../auth/FirebaseAuthMiddleware.js';
// User handlers
import { RegisterUserHandler } from '../../application/commands/handlers/user/RegisterUserHandler.js';
import { RecordLoginHandler } from '../../application/commands/handlers/user/RecordLoginHandler.js';
import { UpdateUserHandler } from '../../application/commands/handlers/user/UpdateUserHandler.js';
import { ChangeUserRoleHandler } from '../../application/commands/handlers/user/ChangeUserRoleHandler.js';
import { SuspendUserHandler } from '../../application/commands/handlers/user/SuspendUserHandler.js';
import { ReactivateUserHandler } from '../../application/commands/handlers/user/ReactivateUserHandler.js';
import { DeactivateUserHandler } from '../../application/commands/handlers/user/DeactivateUserHandler.js';
import { UpdateUserPreferencesHandler } from '../../application/commands/handlers/user/UpdateUserPreferencesHandler.js';
// User query handlers
import { GetUserListHandler } from '../../application/queries/handlers/user/GetUserListHandler.js';
import { GetUserDetailHandler } from '../../application/queries/handlers/user/GetUserDetailHandler.js';
// User projections
import { UserListProjection } from '../projections/UserListProjection.js';

export interface AppContainer {
  eventStore: FirestoreEventStore;
  readModelRepo: FirestoreReadModelRepo;
  fileStorage: FirebaseStorageAdapter;
  commandBus: InProcessCommandBus;
  queryBus: InProcessQueryBus;
  eventBus: InProcessEventBus;
  projectionEngine: ProjectionEngine;
  authMiddleware: FirebaseAuthMiddleware;
}

let _container: AppContainer | null = null;

export function createContainer(): AppContainer {
  if (_container) return _container;

  const db = getFirestoreDb();
  const auth = getFirebaseAuth();
  const storage = getFirebaseStorage();

  const eventBus = new InProcessEventBus();
  const commandBus = new InProcessCommandBus();
  const queryBus = new InProcessQueryBus();
  const eventStore = new FirestoreEventStore(db, eventBus);
  const readModelRepo = new FirestoreReadModelRepo(db);
  const fileStorage = new FirebaseStorageAdapter(storage);
  const projectionEngine = new ProjectionEngine(db);
  const bootstrapRepo = new FirestoreBootstrapRepository(db);
  const authMiddleware = new FirebaseAuthMiddleware(auth, readModelRepo, commandBus);

  // Register command handlers
  commandBus.register('RegisterUser', new RegisterUserHandler(eventStore, bootstrapRepo));
  commandBus.register('RecordLogin', new RecordLoginHandler(eventStore));
  commandBus.register('UpdateUser', new UpdateUserHandler(eventStore));
  commandBus.register('ChangeUserRole', new ChangeUserRoleHandler(eventStore, readModelRepo));
  commandBus.register('SuspendUser', new SuspendUserHandler(eventStore, readModelRepo));
  commandBus.register('ReactivateUser', new ReactivateUserHandler(eventStore));
  commandBus.register('DeactivateUser', new DeactivateUserHandler(eventStore, readModelRepo));
  commandBus.register('UpdateUserPreferences', new UpdateUserPreferencesHandler(eventStore));

  // Register query handlers
  queryBus.register('GetUserList', new GetUserListHandler(readModelRepo));
  queryBus.register('GetUserDetail', new GetUserDetailHandler(readModelRepo));

  // Register projections
  projectionEngine.register(new UserListProjection(readModelRepo));

  // Wire projection engine to event bus
  eventBus.subscribe('UserRegistered', { handle: e => projectionEngine.dispatch(e) });
  eventBus.subscribe('UserUpdated', { handle: e => projectionEngine.dispatch(e) });
  eventBus.subscribe('UserRoleChanged', { handle: e => projectionEngine.dispatch(e) });
  eventBus.subscribe('UserPermissionsUpdated', { handle: e => projectionEngine.dispatch(e) });
  eventBus.subscribe('UserSuspended', { handle: e => projectionEngine.dispatch(e) });
  eventBus.subscribe('UserReactivated', { handle: e => projectionEngine.dispatch(e) });
  eventBus.subscribe('UserDeactivated', { handle: e => projectionEngine.dispatch(e) });
  eventBus.subscribe('UserLoggedIn', { handle: e => projectionEngine.dispatch(e) });

  _container = {
    eventStore,
    readModelRepo,
    fileStorage,
    commandBus,
    queryBus,
    eventBus,
    projectionEngine,
    authMiddleware,
  };

  return _container;
}

export function resetContainer(): void {
  _container = null;
}
