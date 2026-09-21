import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class AdminProductSpecificationResponseDto {
  @ApiProperty()
  key!: string;

  @ApiProperty()
  labelRu!: string;

  @ApiProperty()
  labelEn!: string;

  @ApiProperty()
  valueRu!: string;

  @ApiProperty()
  valueEn!: string;

  @ApiPropertyOptional()
  unitRu!: string;

  @ApiPropertyOptional()
  unitEn!: string;
}

export class ProductSpecificationResponseDto {
  @ApiProperty()
  key!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  value!: string;

  @ApiPropertyOptional()
  unit!: string;
}