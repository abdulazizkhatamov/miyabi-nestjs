import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(categorySlug?: string, page = 1, limit = 10) {
    const where: Prisma.ProductWhereInput = { status: true };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { images: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }
}
