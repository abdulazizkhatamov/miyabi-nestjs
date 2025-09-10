import { Controller, Post, Body, Req, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login.dto';
import type { Request } from 'express';
import { AuthGuard } from './auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginAuthDto })
  login(@Req() req: Request, @Body() dto: LoginAuthDto) {
    return this.authService.login(req, dto);
  }

  @Post('logout')
  logout(@Req() req: Request) {
    return this.authService.logout(req);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@Req() req: Request) {
    return { admin: req.session.admin };
  }
}
