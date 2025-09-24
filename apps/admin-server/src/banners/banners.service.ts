import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { PrismaService } from '@app/common';
import { Banner, Prisma } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  async create(createBannerDto: CreateBannerDto) {
    const { name } = createBannerDto;

    // save in DB
    const banner = await this.prisma.banner.create({
      data: {
        name,
      },
    });

    return banner;
  }

  async findAll(params: {
    page?: number;
    pageSize?: number;
    where?: Prisma.BannerWhereInput;
    orderBy?: Prisma.BannerOrderByWithRelationInput;
  }) {
    const { page = 1, pageSize = 10, where, orderBy } = params;

    const skip = (page - 1) * pageSize;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.banner.findMany({
        skip,
        take: pageSize,
        where,
        orderBy,
        include: { images: true },
      }),
      this.prisma.banner.count({ where }),
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
    const banner = await this.prisma.banner.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }

    return banner;
  }

  async update(id: string, updateBannerDto: UpdateBannerDto) {
    // Find existing banner
    const existingBanner = await this.prisma.banner.findUnique({
      where: { id },
    });
    if (!existingBanner) throw new NotFoundException('Banner not found');

    const { name } = updateBannerDto;

    const data: Partial<Banner> = {};

    // Only update fields that exist in DTO
    if (name && name !== existingBanner.name) {
      data.name = name;
    }

    const updatedBanner = await this.prisma.banner.update({
      where: { id },
      data,
    });

    return updatedBanner;
  }

  async remove(id: string) {
    // Find existing banner
    const existingBanner = await this.prisma.banner.findUnique({
      where: { id },
    });
    if (!existingBanner) throw new NotFoundException('Banner not found');

    const image = await this.prisma.image.findFirst({
      where: { banner_id: existingBanner.id },
    });

    if (image) {
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
    }

    return this.prisma.banner.delete({ where: { id } });
  }
}
