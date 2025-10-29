import { Injectable, Inject } from '@nestjs/common';
import type { Request } from 'express';
import type Redis from 'ioredis';
import * as crypto from 'crypto';
import { generateToken } from './csrf-sync';

@Injectable()
export class CsrfService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async generateCsrfToken(req: Request): Promise<{ token: string }> {
    const sessionId = req.sessionID;
    const session = req.session;

    if (!sessionId || !session) {
      throw new Error('Missing session');
    }

    // ✅ Store the CSRF secret inside the session itself
    if (!session.csrfSecret) {
      session.csrfSecret = crypto.randomUUID();
    }

    const token = generateToken(req);
    // Optional: store the token for debugging or verification
    session.csrfToken = token;

    // Saving is required because express-session doesn't persist automatically
    await new Promise<void>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      session.save((err: any) => (err ? reject(err) : resolve()));
    });

    return { token };
  }
}
