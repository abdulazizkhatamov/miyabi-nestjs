import { IsString, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Chicken Burger' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Juicy grilled chicken with fresh veggies' })
  @IsString()
  description: string;

  @ApiProperty({ example: 350, description: 'Weight in grams' })
  @IsNumber()
  weight: number;

  @ApiProperty({ example: '25.50', description: 'Price (string for Decimal)' })
  @IsString()
  price: string;

  @ApiProperty({ example: 'uuid-of-category' })
  @IsUUID()
  category_id: string;
}
