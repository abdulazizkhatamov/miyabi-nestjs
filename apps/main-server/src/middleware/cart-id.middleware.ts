// cart-id.middleware.ts
import { v4 as uuid } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { RedisClientType } from 'redis';

export function cartIdMiddleware(redis: RedisClientType) {
  return async (req: Request, res: Response, next: NextFunction) => {
    let cartId = req.cookies['cart_id'] as string;

    if (!cartId) {
      cartId = uuid();
      res.cookie('cart_id', cartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      });

      await redis.set(
        `cart:${cartId}`,
        JSON.stringify({ items: [], totalQuantity: 0, totalPrice: '0' }),
      );
    }

    req.cartId = cartId; // ✅ properly typed now
    next();
  };
}
