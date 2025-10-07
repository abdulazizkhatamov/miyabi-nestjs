import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOne(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug: slug, status: true },
      include: { images: true, category: true },
    });

    if (!product)
      return new NotFoundException(`Product with ${slug} slug is not found.`);

    return product;
  }
}
