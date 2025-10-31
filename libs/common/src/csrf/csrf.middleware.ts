// libs/common/src/csrf/csrf.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { csrfSynchronisedProtection } from './csrf-sync';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      csrfSynchronisedProtection(req, res, (err?: any) => {
        if (err) {
          return res.status(403).json({ message: 'Invalid CSRF token' });
        }
        next();
      });
    } else {
      next();
    }
  }
}
