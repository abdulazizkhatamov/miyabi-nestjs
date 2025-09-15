import { ApiProperty } from '@nestjs/swagger';
import { ImageType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class CreateImageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file for the category',
  })
  image: any; // handled by multer

  @ApiProperty({
    enum: ImageType,
    description: 'Type of the image (category | product)',
  })
  @IsEnum(ImageType, { message: 'Invalid image type provided' })
  type: ImageType;

  @ApiProperty({
    type: 'string',
    description:
      'The ID of the entity (Product ID or Category ID) this image belongs to',
  })
  entity_id: string;
}
