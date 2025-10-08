import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MeilisearchModule } from '@app/common';

@Module({
  imports: [MeilisearchModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
