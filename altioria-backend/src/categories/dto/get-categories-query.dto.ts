import { IsEnum, IsOptional } from 'class-validator';

export enum CategoryLocale {
  RU = 'ru',
  EN = 'en',
}

export class GetCategoriesQueryDto {
  @IsOptional()
  @IsEnum(CategoryLocale)
  locale?: CategoryLocale;
}