import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@app/common';
import type { Request } from 'express';
import type { RedisClientType } from 'redis';
import { CartUpdateDto } from './dto/cart-item.dto';

interface Cart {
  items: {
    id: string;
    name: string;
    price: string;
    quantity: number;
    image?: string;
  }[];
  totalQuantity: number;
  totalPrice: string;
}

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    @Inject('REDIS_CLIENT') private redis: RedisClientType,
  ) {}

  private getCartKey(cartId: string) {
    return `cart:${cartId}`;
  }

  /**
   * Loads cart from Redis, initializes if missing
   */
  private async loadCart(cartId: string): Promise<Cart> {
    const key = this.getCartKey(cartId);
    const data = await this.redis.get(key);

    if (data) {
      return JSON.parse(data) as Cart;
    }

    const emptyCart: Cart = { items: [], totalQuantity: 0, totalPrice: '0' };
    await this.redis.set(key, JSON.stringify(emptyCart));
    return emptyCart;
  }

  /**
   * Persists cart in Redis
   */
  private async saveCart(cartId: string, cart: Cart): Promise<void> {
    await this.redis.setEx(
      this.getCartKey(cartId),
      60 * 60 * 24 * 30,
      JSON.stringify(cart),
    );
  }

  /**
   * Recalculates totals for the cart.
   */
  private recalculateCart(cart: Cart): Cart {
    cart.totalQuantity = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    cart.totalPrice = cart.items
      .reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)
      .toFixed(2);
    return cart;
  }

  /**
   * Adds product to cart or increments quantity if already present.
   */
  async updateCart(req: Request, dto: CartUpdateDto): Promise<Cart> {
    if (!req.cartId) throw new Error('cartId missing from request');

    // Load cart
    const cart = await this.loadCart(req.cartId);

    // Fetch all products from DB for validation
    const productIds = dto.items.map((i) => i.id);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { images: true },
    });

    // Rebuild cart items
    const newItems: Cart['items'] = [];

    for (const item of dto.items) {
      if (item.quantity <= 0) continue;

      const product = products.find((p) => p.id === item.id);
      if (!product) continue; // silently ignore invalid productIds

      newItems.push({
        id: product.id,
        name: product.name,
        price: product.price.toString(),
        quantity: item.quantity,
        image: product.images[0]?.path ?? undefined,
      });
    }

    cart.items = newItems;
    this.recalculateCart(cart);
    await this.saveCart(req.cartId, cart);

    return cart;
  }

  /**
   * Clears the entire cart
   */
  async clearCart(req: Request): Promise<Cart> {
    if (!req.cartId) throw new Error('cartId missing from request');
    const emptyCart: Cart = { items: [], totalQuantity: 0, totalPrice: '0' };
    await this.saveCart(req.cartId, emptyCart);
    return emptyCart;
  }

  /**
   * Get current cart
   */
  async getCart(req: Request): Promise<Cart> {
    if (!req.cartId) throw new Error('cartId missing from request');
    return this.loadCart(req.cartId);
  }
}
