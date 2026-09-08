import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import { ContentLocale } from '../../common/enums/content-locale.enum';

export class SearchQueryDto {
  @ApiProperty({
    example: 'altair',
    minLength: 2,
    maxLength: 100,
  })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  @Length(2, 100)
  q!: string;

  @ApiPropertyOptional({
    enum: ContentLocale,
    default: ContentLocale.RU,
  })
  @IsOptional()
  @IsEnum(ContentLocale)
  locale?: ContentLocale;

  @ApiPropertyOptional({
    default: 10,
    minimum: 1,
    maximum: 20,
  })
  @Transform(({ value }) => {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return undefined;
    }

    return Number(value);
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number;
}