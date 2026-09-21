import { Prisma } from '../../generated/prisma/client';

import {
  AdminProductSpecificationResponseDto,
  ProductSpecificationResponseDto,
} from '../dto/product-specification-response.dto';

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function readRequiredString(
  record: Record<string, unknown>,
  field: string,
): string | null {
  const value = record[field];

  return typeof value === 'string'
    ? value
    : null;
}

function readOptionalString(
  record: Record<string, unknown>,
  field: string,
): string {
  const value = record[field];

  return typeof value === 'string'
    ? value
    : '';
}

export function normalizeProductSpecifications(
  value: Prisma.JsonValue,
): AdminProductSpecificationResponseDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const key =
      readRequiredString(item, 'key');

    const labelRu =
      readRequiredString(item, 'labelRu');

    const labelEn =
      readRequiredString(item, 'labelEn');

    const valueRu =
      readRequiredString(item, 'valueRu');

    const valueEn =
      readRequiredString(item, 'valueEn');

    if (
      key === null ||
      labelRu === null ||
      labelEn === null ||
      valueRu === null ||
      valueEn === null
    ) {
      return [];
    }

    return [
      {
        key,
        labelRu,
        labelEn,
        valueRu,
        valueEn,
        unitRu:
          readOptionalString(
            item,
            'unitRu',
          ),
        unitEn:
          readOptionalString(
            item,
            'unitEn',
          ),
      },
    ];
  });
}

export function mergeProductSpecifications(
  productSpecifications:
    AdminProductSpecificationResponseDto[],
  variantSpecifications:
    AdminProductSpecificationResponseDto[],
): AdminProductSpecificationResponseDto[] {
  const specificationsByKey = new Map<
    string,
    AdminProductSpecificationResponseDto
  >();

  for (
    const specification of
    productSpecifications
  ) {
    specificationsByKey.set(
      specification.key,
      specification,
    );
  }

  for (
    const specification of
    variantSpecifications
  ) {
    specificationsByKey.set(
      specification.key,
      specification,
    );
  }

  return [
    ...specificationsByKey.values(),
  ];
}

export function localizeProductSpecifications(
  specifications:
    AdminProductSpecificationResponseDto[],
  isEnglish: boolean,
): ProductSpecificationResponseDto[] {
  return specifications.map(
    (specification) => ({
      key: specification.key,

      label: isEnglish
        ? specification.labelEn
        : specification.labelRu,

      value: isEnglish
        ? specification.valueEn
        : specification.valueRu,

      unit: isEnglish
        ? specification.unitEn
        : specification.unitRu,
    }),
  );
}