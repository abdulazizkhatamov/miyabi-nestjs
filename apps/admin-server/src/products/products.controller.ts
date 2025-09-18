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

    // normalize to array of booleans
    const statusArray = Array.isArray(status) ? status : status ? [status] : [];
    const parsedStatuses = statusArray.map((s) => s === 'true');

    let statusFilter: boolean | undefined;
    if (parsedStatuses.length === 1) {
      statusFilter = parsedStatuses[0]; // single true or false
    }
    // if both true and false selected → no filter applied (statusFilter stays undefined)

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
