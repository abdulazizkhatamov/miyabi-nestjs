import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';
import { IsBoolean } from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiProperty({
    example: true,
    description: 'Category status: true=active, false=inactive',
    required: false,
  })
  @IsBoolean()
  status: boolean; // ✅ boolean, optional
}
