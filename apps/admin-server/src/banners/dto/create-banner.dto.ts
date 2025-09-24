import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBannerDto {
  @ApiProperty({
    example: 'Category name',
    description: 'Name of the category',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
