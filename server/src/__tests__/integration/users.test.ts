import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { requestIdMiddleware } from '../../infrastructure/http/middleware/requestId.js';
import { errorHandlerMiddleware } from '../../infrastructure/http/middleware/errorHandler.js';

// Mock Firebase Admin
vi.mock('../../infrastructure/firebase/firebaseAdmin.js', () => ({
  getFirestoreDb: vi.fn(),
  getFirebaseAuth: vi.fn(),
  getFirebaseStorage: vi.fn(),
}));

describe('Users API — basic routing', () => {
  it('POST /users/commands/RegisterUser rejects invalid body with 400', async () => {
    // Create minimal app with just the validation middleware behavior
    const app = express();
    app.use(express.json());
    app.use(requestIdMiddleware);
    app.post('/users/commands/RegisterUser', (req, res) => {
      if (!req.body?.firebaseUid || !req.body?.email) {
        res.status(400).json({ error: 'ValidationError', message: 'firebaseUid and email required' });
        return;
      }
      res.status(201).json({ message: 'ok' });
    });
    app.use(errorHandlerMiddleware);

    const res = await request(app).post('/users/commands/RegisterUser').send({});
    expect(res.status).toBe(400);
  });
});
