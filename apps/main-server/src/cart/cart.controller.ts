import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartItemDto } from './dto/cart-item.dto';
import type { Request } from 'express';
// cart.controller.ts
import { Cart } from './cart.types';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  addToCart(
    @Req() request: Request,
    @Body() cartItemDto: CartItemDto,
  ): Promise<Cart> {
    return this.cartService.addToCart(request, cartItemDto);
  }

  @Post('remove')
  removeFromCart(
    @Req() request: Request,
    @Body() cartItemDto: CartItemDto,
  ): Promise<Cart> {
    return this.cartService.removeFromCart(request, cartItemDto);
  }

  @Post('clear')
  clearCart(@Req() request: Request): Promise<Cart> {
    return this.cartService.clearCart(request);
  }

  @Get()
  getCart(@Req() request: Request): Promise<Cart> {
    return this.cartService.getCart(request);
  }
}
