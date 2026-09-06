import { BadRequestException } from '@nestjs/common';

import { ProductPriceType } from '../../generated/prisma/client';

export interface ProductVariantPriceInput {
  priceType?: ProductPriceType;
  priceAmount?: string;
  priceCurrency?: string;
}

export interface CurrentProductVariantPrice {
  priceType: ProductPriceType;
  priceAmount: { toString(): string } | null;
  priceCurrency: string | null;
}

export interface ResolvedProductVariantPrice {
  priceType: ProductPriceType;
  priceAmount: string | null;
  priceCurrency: string | null;
}

export function resolveProductVariantPrice(
  input: ProductVariantPriceInput,
  current?: CurrentProductVariantPrice,
): ResolvedProductVariantPrice {
  const priceType =
    input.priceType ??
    current?.priceType ??
    ProductPriceType.ON_REQUEST;

  if (priceType === ProductPriceType.ON_REQUEST) {
    if (
      input.priceAmount !== undefined ||
      input.priceCurrency !== undefined
    ) {
      throw new BadRequestException(
        'Для цены по запросу нельзя указывать стоимость и валюту',
      );
    }

    return {
      priceType,
      priceAmount: null,
      priceCurrency: null,
    };
  }

  const priceAmount =
    input.priceAmount ??
    current?.priceAmount?.toString();

  const priceCurrency =
    input.priceCurrency ?? current?.priceCurrency;

  if (!priceAmount || !priceCurrency) {
    throw new BadRequestException(
      'Для фиксированной цены необходимо указать priceAmount и priceCurrency',
    );
  }

  if (Number(priceAmount) <= 0) {
    throw new BadRequestException(
      'Стоимость товара должна быть больше нуля',
    );
  }

  return {
    priceType,
    priceAmount,
    priceCurrency,
  };
}
