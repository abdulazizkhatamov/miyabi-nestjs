import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { generateUniqueSlug, PrismaService } from '@app/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    image: Express.Multer.File,
  ) {
    const { name } = createCategoryDto;

    // generate unique slug
    const slug = await generateUniqueSlug(this.prisma, 'category', name);

    // image.path already contains the full disk path
    // store relative path in DB
    const filePath = `/uploads/${image.filename}`;

    // save in DB
    const category = await this.prisma.category.create({
      data: {
        name,
        slug,
        image: filePath,
      },
    });

    return category;
  }

  findAll() {
    return this.prisma.category.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    image?: Express.Multer.File,
  ) {
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!existingCategory) throw new NotFoundException('Category not found');

    const { name, status } = updateCategoryDto;

    let slug = existingCategory.slug;
    if (name && name !== existingCategory.name) {
      slug = await generateUniqueSlug(this.prisma, 'category', name);
    }

    let filePath = existingCategory.image;
    if (image) {
      const oldImagePath = path.join(
        process.cwd(),
        'public',
        existingCategory.image,
      );
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      filePath = `/uploads/${image.filename}`;
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: {
        name: name ?? existingCategory.name,
        slug,
        status:
          status !== undefined ? status === 'true' : existingCategory.status,
        image: filePath,
      },
    });

    return updatedCategory;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
