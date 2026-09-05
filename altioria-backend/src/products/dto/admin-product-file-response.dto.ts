import {
  ProductFileType,
} from '../../generated/prisma/client';

export class AdminProductFileResponseDto {
  id!: string;
  variantId!: string;

  type!: ProductFileType;

  fileUrl!: string;

  originalName!: string;

  mimeType!: string;

  sizeBytes!: number;

  labelRu!: string;
  labelEn!: string;

  sortOrder!: number;

  createdAt!: Date;
  updatedAt!: Date;
}