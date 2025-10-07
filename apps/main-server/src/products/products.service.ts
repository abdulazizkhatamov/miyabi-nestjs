import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/common';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(categoryId: string, cursor?: string) {
    const products = await this.prisma.product.findMany({
      where: { category_id: categoryId, status: true },

      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { created_at: 'desc' },
      include: { images: true },
    });

    return { products };
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }
}
