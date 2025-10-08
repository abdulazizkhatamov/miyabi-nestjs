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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsQueryDto } from './dto/products-query.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query() query: ProductsQueryDto) {
    const { page, pageSize, name, status } = query;
    const statusArray = Array.isArray(status) ? status : status ? [status] : [];
    const parsedStatuses = statusArray.map((s) => s === 'true');

    let statusFilter: boolean | undefined;
    if (parsedStatuses.length === 1) statusFilter = parsedStatuses[0];

    return this.productsService.findAll({
      page,
      pageSize,
      where: {
        ...(name ? { name: { contains: name, mode: 'insensitive' } } : {}),
        ...(statusFilter !== undefined ? { status: statusFilter } : {}),
      },
      orderBy: { created_at: 'desc' },
    });
  }

  @Get('search')
  search(
    @Query('q') q: string,
    @Query('category') category?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.productsService.search(q, category, +page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
