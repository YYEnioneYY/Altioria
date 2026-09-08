import {
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderProductVariantsDto {
  @ApiProperty({
    type: [String],
    description:
      'ID всех исполнений товара в необходимом порядке',
    example: [
      'cb9d87ec-7746-4bf4-a07f-2836a686583b',
      '21687ddc-9a58-424d-84a0-b01ca983fd50',
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsUUID('4', {
    each: true,
  })
  variantIds!: string[];
}