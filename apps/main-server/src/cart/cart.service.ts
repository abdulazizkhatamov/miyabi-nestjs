import { Injectable, NotFoundException } from '@nestjs/common';
import { CartItemDto } from './dto/cart-item.dto';
import { PrismaService } from '@app/common';
import type { Request } from 'express';

// Reuse your augmented express-session type
type Cart = import('express-session').SessionData['cart'];

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  /**
   * Ensures the session cart exists, otherwise initializes it.
   */
  private ensureCart(request: Request): Cart {
    if (!request.session.cart) {
      request.session.cart = {
        items: [],
        totalQuantity: 0,
        totalPrice: '0',
      };
    }
    return request.session.cart;
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
      .toString();
    return cart;
  }

  /**
   * Adds product to cart or increments quantity if already present.
   */
  async addToCart(request: Request, cartItemDto: CartItemDto): Promise<Cart> {
    const { productId, quantity = 1 } = cartItemDto;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    const cart = this.ensureCart(request);

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

    return this.recalculateCart(cart);
  }

  /**
   * Removes product from cart. If `quantity` is given, decreases it;
   * if the quantity goes to 0 or below, removes the item entirely.
   */
  removeFromCart(request: Request, cartItemDto: CartItemDto): Cart {
    const { productId, quantity = 1 } = cartItemDto;
    const cart = this.ensureCart(request);

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
      // Remove the item completely if quantity <= requested removal
      cart.items.splice(index, 1);
    }

    return this.recalculateCart(cart);
  }
}
