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
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      });
    }

    req.cartId = cartId;
    next();
  }
}
