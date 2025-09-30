import { Body, Controller, Post, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartItemDto } from './dto/cart-item.dto';
import type { Request } from 'express';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  addToCart(@Req() request: Request, @Body() cartItemDto: CartItemDto) {
    return this.cartService.addToCart(request, cartItemDto);
  }

  @Post('remove')
  removeFromCart(@Req() request: Request, @Body() cartItemDto: CartItemDto) {
    return this.cartService.removeFromCart(request, cartItemDto);
  }
}
