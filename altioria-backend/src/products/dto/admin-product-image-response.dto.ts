export class AdminProductImageResponseDto {
  id!: string;
  variantId!: string;

  imageUrl!: string;

  altRu!: string | null;
  altEn!: string | null;

  sortOrder!: number;

  createdAt!: Date;
  updatedAt!: Date;
}