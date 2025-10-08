import { Injectable, NotFoundException } from '@nestjs/common';
import { MeilisearchService, PrismaService } from '@app/common';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly meilisearchService: MeilisearchService,
  ) {}

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

  async search(
    q: string,
    category: string | undefined,
    page: string,
    limit: string,
  ) {
    // Convert category string to filter object
    const filters: Record<string, any> | undefined = category
      ? { category }
      : undefined;

    return this.meilisearchService.searchProducts(
      q,
      filters,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }
}
