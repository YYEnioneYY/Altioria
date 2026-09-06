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

  sortOrder!: number;

  isPublished!: boolean;

  category!: AdminProductCategoryResponseDto;

  variantsCount!: number;

  defaultVariantId!: string | null;

  defaultVariantImagesCount!: number;

  createdAt!: Date;
  updatedAt!: Date;
}
