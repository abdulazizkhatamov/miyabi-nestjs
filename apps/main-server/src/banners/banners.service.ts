import { PrismaService } from '@app/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.banner.findMany({ include: { images: true } });
  }
}
