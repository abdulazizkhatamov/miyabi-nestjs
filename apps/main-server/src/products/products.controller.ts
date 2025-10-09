import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query('categoryId') categoryId: string,
    @Query('cursor') cursor?: string, // for cursor-based pagination
  ) {
    return this.productsService.findAll(categoryId, cursor);
  }

  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.productsService.search(q, page, limit);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productsService.findOne(slug);
  }
}
