import { Injectable, NestMiddleware } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CartIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const cookies = req.cookies as Record<string, string | undefined>;
    let cartId: string | undefined = cookies['cartId'];

    if (!cartId) {
      cartId = uuid();
      res.cookie('cartId', cartId, {
        httpOnly: true,
        secure: true, // ✅ required for SameSite: 'none'
        sameSite: 'none', // ✅ allow sending across sites (vercel <-> render)
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }

    // Attach to request for later use
    req.cartId = cartId;
    next();
  }
}
