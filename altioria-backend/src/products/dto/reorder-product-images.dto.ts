import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsUUID,
} from 'class-validator';

export class ReorderProductImagesDto {
  @ApiProperty({
    type: [String],
    description:
      'ID всех изображений товара в нужном порядке. Первое изображение станет обложкой',
    example: [
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(15)
  @ArrayUnique()
  @IsUUID('4', {
    each: true,
  })
  imageIds!: string[];
}