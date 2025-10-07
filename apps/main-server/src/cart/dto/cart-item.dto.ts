import { IsArray, ValidateNested, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CartUpdateItemDto {
  @IsString()
  id: string;

  @IsInt()
  @Min(0)
  quantity: number;
}

export class CartUpdateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartUpdateItemDto)
  items: CartUpdateItemDto[];
}
