export class AdminCategoryResponseDto {
  id!: string;

  slug!: string;

  nameRu!: string;
  nameEn!: string;

  imageUrl!: string | null;

  sortOrder!: number;

  isPublished!: boolean;
  
  createdAt!: Date;
  updatedAt!: Date;
}