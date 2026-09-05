import { ApiProperty } from '@nestjs/swagger';

export class ProductInquiryResponseDto {
  @ApiProperty({
    example: true,
  })
  success!: boolean;
}