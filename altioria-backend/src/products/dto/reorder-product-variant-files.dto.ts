import {
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderProductVariantFilesDto {
  @ApiProperty({
    type: [String],
    description:
      'ID всех файлов исполнения в нужном порядке',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsUUID('4', {
    each: true,
  })
  fileIds!: string[];
}