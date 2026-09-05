import {
  ProductFileType,
} from '../../generated/prisma/client';

export class ProductDetailsCategoryDto {
  slug!: string;

  name!: string;
}

export class ProductDetailsImageDto {
  id!: string;

  imageUrl!: string;

  alt!: string;
}

export class ProductDetailsFileDto {
  id!: string;
  type!: ProductFileType;

  fileUrl!: string;

  originalName!: string;

  label!: string;

  sizeBytes!: number;
}

export class ProductDetailsVariantDto {
  id!: string;
  slug!: string;

  label!: string | null;

  description!: string | null;

  heightMm!: number | null;
  widthMm!: number | null;
  depthMm!: number | null;

  materials!: string | null;

  isDefault!: boolean;

  images!: ProductDetailsImageDto[];

  files!: ProductDetailsFileDto[];
}

export class ProductDetailsResponseDto {
  id!: string;

  slug!: string;

  name!: string;

  description!: string | null;

  category!: ProductDetailsCategoryDto;

  variants!: ProductDetailsVariantDto[];
}