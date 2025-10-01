import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CartItemDto } from './dto/cart-item.dto';
import { PrismaService } from '@app/common';
import type { Request } from 'express';
import type { RedisClientType } from 'redis';

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
    await this.redis.set(this.getCartKey(cartId), JSON.stringify(cart));
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
  async addToCart(req: Request, cartItemDto: CartItemDto): Promise<Cart> {
    const { productId, quantity = 1 } = cartItemDto;
    if (!req.cartId) throw new Error('cartId missing from request');

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    const cart = await this.loadCart(req.cartId);

    const cartProduct = cart.items.find((item) => item.id === productId);
    if (cartProduct) {
      cartProduct.quantity += quantity;
    } else {
      cart.items.push({
        id: product.id,
        name: product.name,
        price: product.price.toString(),
        quantity,
        image: product.images[0]?.path ?? undefined,
      });
    }

    this.recalculateCart(cart);
    await this.saveCart(req.cartId, cart);

    return cart;
  }

  /**
   * Removes product from cart. If `quantity` is given, decreases it;
   * if the quantity goes to 0 or below, removes the item entirely.
   */
  async removeFromCart(req: Request, cartItemDto: CartItemDto): Promise<Cart> {
    const { productId, quantity = 1 } = cartItemDto;
    if (!req.cartId) throw new Error('cartId missing from request');

    const cart = await this.loadCart(req.cartId);

    const index = cart.items.findIndex((item) => item.id === productId);
    if (index === -1) {
      throw new NotFoundException(
        `Product with id ${productId} not found in cart`,
      );
    }

    const cartProduct = cart.items[index];

    if (cartProduct.quantity > quantity) {
      cartProduct.quantity -= quantity;
    } else {
      cart.items.splice(index, 1);
    }

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
