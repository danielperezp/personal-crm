import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestIdMiddleware } from './infrastructure/http/middleware/requestId.js';
import { createRateLimiter } from './infrastructure/http/middleware/rateLimiter.js';
import { errorHandlerMiddleware } from './infrastructure/http/middleware/errorHandler.js';
import { healthRouter } from './infrastructure/http/routes/healthRoutes.js';
import { createUserRouter } from './infrastructure/http/routes/userRoutes.js';
import { createContainer } from './infrastructure/di/container.js';

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN_LOCAL ?? 'http://localhost:5173',
  ...(process.env.FRONTEND_ORIGIN_PROD ? [process.env.FRONTEND_ORIGIN_PROD] : []),
];

// 1. CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

// 2. Helmet
app.use(helmet());

// 3. JSON body parser
app.use(express.json({ limit: '10mb' }));

// 4. Request ID
app.use(requestIdMiddleware);

// 5. Rate limiting
app.use(createRateLimiter());

// 6. Routes
app.use('/api/v1', healthRouter);

// Module routes wired after container initialization
export function mountRoutes(container: ReturnType<typeof createContainer>): void {
  app.use('/api/v1/users', createUserRouter(
    container.commandBus,
    container.queryBus,
    container.eventStore,
    container.authMiddleware,
  ));
}

// 7. Error handler (must be last)
app.use(errorHandlerMiddleware);

const PORT = Number(process.env.PORT ?? 4000);

export async function startServer(): Promise<void> {
  const container = createContainer();
  mountRoutes(container);

  app.listen(PORT, () => {
    console.log(`NexusCommand server running on port ${PORT}`);
  });
}

export { app };

if (process.env.NODE_ENV !== 'test') {
  startServer().catch(console.error);
}
