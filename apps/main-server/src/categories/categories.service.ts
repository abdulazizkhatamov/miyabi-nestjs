import { Injectable } from '@nestjs/common';

import { PrismaService } from '@app/common';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      where: { status: true },
      orderBy: { created_at: 'desc' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }
}
