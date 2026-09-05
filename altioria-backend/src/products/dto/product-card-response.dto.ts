export class ProductCardCategoryDto {
  slug!: string;

  name!: string;
}

export class ProductCardResponseDto {
  id!: string;

  slug!: string;

  name!: string;

  imageUrl!: string;

  category!: ProductCardCategoryDto;
}