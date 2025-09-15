import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesQueryDto } from './dto/categories-query.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll(@Query() query: CategoriesQueryDto) {
    const { page, pageSize, name, status } = query;

    // normalize to array of booleans
    const statusArray = Array.isArray(status) ? status : status ? [status] : [];
    const parsedStatuses = statusArray.map((s) => s === 'true');

    let statusFilter: boolean | undefined;
    if (parsedStatuses.length === 1) {
      statusFilter = parsedStatuses[0]; // single true or false
    }
    // if both true and false selected → no filter applied (statusFilter stays undefined)

    return this.categoriesService.findAll({
      page,
      pageSize,
      where: {
        ...(name ? { name: { contains: name, mode: 'insensitive' } } : {}),
        ...(statusFilter !== undefined ? { status: statusFilter } : {}),
      },
      orderBy: { created_at: 'desc' },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
