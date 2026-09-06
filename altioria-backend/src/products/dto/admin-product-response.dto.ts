export class AdminProductCategoryResponseDto {
  id!: string;

  slug!: string;

  nameRu!: string;
  nameEn!: string;
}

export class AdminProductResponseDto {
  id!: string;
  categoryId!: string;

  slug!: string;

  nameRu!: string;
  nameEn!: string;

  descriptionRu!: string | null;
  descriptionEn!: string | null;

  sortOrder!: number;

  isPublished!: boolean;

  category!: AdminProductCategoryResponseDto;

  variantsCount!: number;

  defaultVariantId!: string | null;

  createdAt!: Date;
  updatedAt!: Date;
}
