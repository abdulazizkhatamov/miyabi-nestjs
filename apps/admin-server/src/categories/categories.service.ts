import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { generateUniqueSlug, PrismaService } from '@app/common';
import { Category, Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, description } = createCategoryDto;

    // generate unique slug
    const slug = await generateUniqueSlug(this.prisma, 'category', name);

    // save in DB
    const category = await this.prisma.category.create({
      data: {
        name,
        description,
        slug,
      },
    });

    return category;
  }

  async findAll(params: {
    page?: number;
    pageSize?: number;
    where?: Prisma.CategoryWhereInput;
    orderBy?: Prisma.CategoryOrderByWithRelationInput;
  }) {
    const { page = 1, pageSize = 10, where, orderBy } = params;

    const skip = (page - 1) * pageSize;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        skip,
        take: pageSize,
        where,
        orderBy,
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    // Find existing category
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!existingCategory) throw new NotFoundException('Category not found');

    const { name, description, status } = updateCategoryDto;

    const data: Partial<Category> = {};

    // Only update fields that exist in DTO
    if (name && name !== existingCategory.name) {
      data.name = name;
      data.slug = await generateUniqueSlug(this.prisma, 'category', name);
    }
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data,
    });

    return updatedCategory;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
