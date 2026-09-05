import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

import { ContentLocale } from '../../common/enums/content-locale.enum';

export class GetProductsQueryDto {
  @IsOptional()
  @IsEnum(ContentLocale)
  locale?: ContentLocale;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsOptional()
  @IsString()
  @Length(2, 80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  category?: string;
}