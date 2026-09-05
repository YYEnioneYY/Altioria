import { Transform } from 'class-transformer';
import { IsEnum, IsString, Length } from 'class-validator';

import { ContentLocale } from '../../common/enums/content-locale.enum';

export class SearchQueryDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(2, 100)
  q!: string;

  @IsEnum(ContentLocale)
  locale: ContentLocale = ContentLocale.RU;
}