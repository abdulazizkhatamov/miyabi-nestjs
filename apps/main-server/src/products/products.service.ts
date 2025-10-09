import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { Prisma } from '@prisma/client';

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

  async search(
    q: string,
    category: string | undefined,
    page: string,
    limit: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    // Build OR condition
    const orConditions: Prisma.ProductWhereInput[] = [];
    if (q && q.trim() !== '') {
      orConditions.push(
        { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
        {
          category: {
            name: { contains: q, mode: Prisma.QueryMode.insensitive },
          },
        },
      );
    }

    // Build main where
    const where: Prisma.ProductWhereInput = {
      AND: [
        ...(orConditions.length > 0 ? [{ OR: orConditions }] : []),
        ...(category ? [{ category: { slug: category } }] : []),
      ],
      status: true, // ✅ only active products
    };

    // Fetch products
    const products = await this.prisma.product.findMany({
      where,
      include: { category: true },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });

    // Count total for pagination
    const total = await this.prisma.product.count({ where });

    return {
      items: products,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }
}
