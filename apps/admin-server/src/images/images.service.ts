import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { PrismaService } from '@app/common';
import { ImageType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImagesService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(createImageDto: CreateImageDto, image: Express.Multer.File) {
    const { type, entity_id } = createImageDto;

    const baseUrl =
      this.configService.get<string>('ADMIN_SERVER_URL') ??
      'http://localhost:3001';
    const filePath = `${baseUrl}/public/uploads/${image.filename}`;

    switch (type) {
      case ImageType.category: {
        const category = await this.prisma.category.findUnique({
          where: { id: entity_id },
        });
        if (!category) {
          throw new NotFoundException('Category not found');
        }

        return this.prisma.image.create({
          data: {
            path: filePath,
            type,
            category_id: entity_id,
          },
        });
      }

      case ImageType.product: {
        const product = await this.prisma.product.findUnique({
          where: { id: entity_id },
        });
        if (!product) {
          throw new NotFoundException('Product not found');
        }

        return this.prisma.image.create({
          data: {
            path: filePath,
            type,
            product_id: entity_id,
          },
        });
      }

      case ImageType.banner: {
        const banner = await this.prisma.banner.findUnique({
          where: { id: entity_id },
        });
        if (!banner) {
          throw new NotFoundException('Banner not found');
        }

        return this.prisma.image.create({
          data: { path: filePath, type, banner_id: entity_id },
        });
      }

      default:
        throw new BadRequestException('Invalid image type');
    }
  }

  findAll() {
    return `This action returns all images`;
  }

  findOne(id: number) {
    return `This action returns a #${id} image`;
  }

  update(id: number, updateImageDto: UpdateImageDto) {
    return `This action updates a #${id} image`;
  }

  async remove(id: string) {
    const image = await this.prisma.image.findUnique({ where: { id } });

    if (!image) throw new NotFoundException('Image not found');

    const filePath = path.join(
      process.cwd(),
      'public',
      'uploads',
      path.basename(image.path),
    );

    try {
      await fs.promises.unlink(filePath);
    } catch {
      throw new InternalServerErrorException('Failed to delete image file');
    }

    // Delete record from DB
    return this.prisma.image.delete({ where: { id } });
  }
}
