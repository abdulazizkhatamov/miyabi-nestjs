import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CartItemDto {
  @ApiProperty({
    description: 'Product unique ID',
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Quantity of product that will be added to cart',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number = 1;
}
