import { Controller, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('session')
  findOne(@Req() request: Request) {
    return {
      user: request.session.user || null,
      cart: request.session.cart || {
        items: [],
        totalQuantity: 0,
        totalPrice: '0.00',
      },
    };
  }
}
