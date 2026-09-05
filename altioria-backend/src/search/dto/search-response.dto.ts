import { CategoryResponseDto } from '../../categories/dto/category-response.dto';
import { ProductCardResponseDto } from '../../products/dto/product-card-response.dto';

export class SearchResponseDto {
  categories!: CategoryResponseDto[];
  products!: ProductCardResponseDto[];
}