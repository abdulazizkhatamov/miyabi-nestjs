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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }
}
