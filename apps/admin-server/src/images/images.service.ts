import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { PrismaService } from '@app/common';
import { ImageType } from '@prisma/client';

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  async create(createImageDto: CreateImageDto, image: Express.Multer.File) {
    const { type, entity_id } = createImageDto;
    const filePath = `/uploads/${image.filename}`;
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
            type, // already ImageType.category
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

  remove(id: number) {
    return `This action removes a #${id} image`;
  }
}
