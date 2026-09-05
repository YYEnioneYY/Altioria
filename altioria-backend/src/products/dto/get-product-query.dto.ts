import {
  IsEnum,
  IsOptional,
} from 'class-validator';

import { ContentLocale } from '../../common/enums/content-locale.enum';

export class GetProductQueryDto {
  @IsOptional()
  @IsEnum(ContentLocale)
  locale?: ContentLocale;
}