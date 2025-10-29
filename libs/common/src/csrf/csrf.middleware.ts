// libs/common/src/csrf/csrf.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { csrfSynchronisedProtection } from './csrf-sync'; // ✅ no invalidCsrfTokenError import
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Only protect mutating requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      csrfSynchronisedProtection(req, res, (err?: any) => {
        if (err) {
          // ✅ Use your own simplified error response
          res.status(403).json({
            message: 'Invalid CSRF token',
            statusCode: 403,
            error: 'Forbidden',
          });
          return;
        }
        next();
      });
    } else {
      next();
    }
  }
}
