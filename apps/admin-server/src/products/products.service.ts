import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService, generateUniqueSlug } from '@app/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const { name, description, weight, price, category_id } = dto;

    // generate unique slug for product
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
      data: data,
      meta: {
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, images: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing)
      throw new NotFoundException(`Product with ID ${id} not found`);

    const { name, description, weight, price, category_id, status } = dto;

    const data: Partial<Product> = {};

    // Only include changed fields
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

    return updated;
  }

  async remove(id: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing)
      throw new NotFoundException(`Product with ID ${id} not found`);

    await this.prisma.product.delete({ where: { id } });

    return { message: `Product with ID ${id} deleted successfully` };
  }
}
