import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/common';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(categoryId: string, cursor?: string, take = 10) {
    const products = await this.prisma.product.findMany({
      where: { category_id: categoryId },
      take: take + 1, // fetch one extra to check if there’s a next page
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { created_at: 'desc' },
      include: { images: true },
    });

    let nextCursor: string | null = null;
    if (products.length > take) {
      const nextItem = products.pop();
      nextCursor = nextItem?.id ?? null; // safe fallback
    }

    return { products, nextCursor };
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }
}
