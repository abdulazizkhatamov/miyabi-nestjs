import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import type { Request } from 'express';
import { Cart } from './cart.types';
import { CartUpdateDto } from './dto/cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('clear')
  clearCart(@Req() request: Request): Promise<Cart> {
    return this.cartService.clearCart(request);
  }

  @Post('update')
  updateCart(
    @Req() request: Request,
    @Body() dto: CartUpdateDto,
  ): Promise<Cart> {
    return this.cartService.updateCart(request, dto);
  }

  @Get()
  getCart(@Req() request: Request): Promise<Cart> {
    return this.cartService.getCart(request);
  }
}
