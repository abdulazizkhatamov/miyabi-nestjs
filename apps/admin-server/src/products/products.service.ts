import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import {
  MeilisearchService,
  PrismaService,
  generateUniqueSlug,
} from '@app/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly meilisearchService: MeilisearchService,
  ) {}

  async create(dto: CreateProductDto) {
    const { name, description, weight, price, category_id } = dto;
    const slug = await generateUniqueSlug(this.prisma, 'product', name);

    const product = await this.prisma.product.create({
      data: {
        name,
        description,
        weight,
        price: new Decimal(price),
        category_id,
        slug,
      },
      include: { category: true },
    });

    // Index product in Meilisearch
    await this.meilisearchService.indexProducts([
      {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category?.name || '',
        slug: product.slug,
        status: product.status,
      },
    ]);

    return product;
  }

  async findAll(params: {
    page?: number;
    pageSize?: number;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }) {
    const { page = 1, pageSize = 10, where, orderBy } = params;
    const skip = (page - 1) * pageSize;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip,
        take: pageSize,
        where,
        orderBy,
        include: { category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, pageSize, pageCount: Math.ceil(total / pageSize) },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, images: true },
    });
    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing)
      throw new NotFoundException(`Product with ID ${id} not found`);

    const { name, description, weight, price, category_id, status } = dto;
    const data: Partial<Product> = {};

    if (name && name !== existing.name) {
      data.name = name;
      data.slug = await generateUniqueSlug(this.prisma, 'product', name);
    }
    if (description !== undefined) data.description = description;
    if (weight !== undefined) data.weight = weight;
    if (price !== undefined) data.price = new Decimal(price);
    if (category_id !== undefined) data.category_id = category_id;
    if (status !== undefined) data.status = status;

    const updated = await this.prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });

    // Update index in Meilisearch
    await this.meilisearchService.indexProducts([
      {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        price: updated.price,
        category: updated.category?.name || '',
        slug: updated.slug,
        status: updated.status,
      },
    ]);

    return updated;
  }

  async remove(id: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing)
      throw new NotFoundException(`Product with ID ${id} not found`);

    await this.prisma.product.delete({ where: { id } });

    // Remove from Meilisearch index
    await this.meilisearchService.deleteProduct(id);

    return { message: `Product with ID ${id} deleted successfully` };
  }

  /** Search products (for main-server) */
  async search(term: string, category?: string, page = 1, limit = 20) {
    const filters = category ? { category } : {};
    return this.meilisearchService.searchProducts(term, filters, page, limit);
  }
}
