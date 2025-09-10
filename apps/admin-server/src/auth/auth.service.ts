import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import type { Request } from 'express';
import { LoginAuthDto } from './dto/login.dto';
import argon2 from 'argon2';
import { PrismaService } from '@app/common';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(req: Request, loginDto: LoginAuthDto) {
    const { email, password } = loginDto;

    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const isValid = await argon2.verify(admin.password, password);
    if (!isValid) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    req.session.admin = {
      id: admin.id,
      email: admin.email,
      first_name: admin.first_name,
      last_name: admin.last_name ?? '',
    };

    return { message: 'Admin logged in successfully' };
  }

  logout(req: Request) {
    req.session.destroy(() => {});
    return { message: 'Logged out successfully' };
  }
}
