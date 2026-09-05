import { Transform } from 'class-transformer';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

function trim(value: unknown): unknown {
  return typeof value === 'string'
    ? value.trim()
    : value;
}

export class CreateProductInquiryDto {
  @ApiProperty({
    format: 'uuid',
  })
  @IsUUID()
  productId!: string;

  @ApiProperty({
    format: 'uuid',
  })
  @IsUUID()
  variantId!: string;

  @ApiProperty({
    example: 'Иван Иванов',
  })
  @Transform(({ value }: { value: unknown }) =>
    trim(value),
  )
  @IsString()
  @Length(2, 100)
  name!: string;

  @ApiProperty({
    example: 'ivan@example.com',
  })
  @Transform(({ value }: { value: unknown }) =>
    trim(value),
  )
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({
    example: '+7 (999) 123-45-67',
  })
  @Transform(({ value }: { value: unknown }) =>
    trim(value),
  )
  @IsString()
  @Matches(/^[0-9+()\-\s]{7,30}$/, {
    message: 'Некорректный номер телефона',
  })
  phone!: string;

  @ApiPropertyOptional({
    example: 'Подскажите сроки изготовления',
    maxLength: 2000,
  })
  @Transform(({ value }: { value: unknown }) =>
    trim(value),
  )
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  questions?: string;

  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  @Equals(true, {
    message:
      'Необходимо согласиться с политикой конфиденциальности',
  })
  privacyAccepted!: boolean;
}