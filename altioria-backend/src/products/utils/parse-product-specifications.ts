import {
  BadRequestException,
} from '@nestjs/common';

import {
  Prisma,
} from '../../generated/prisma/client';

const MAX_SPECIFICATIONS = 50;

type SpecificationRecord =
  Record<string, unknown>;

function isRecord(
  value: unknown,
): value is SpecificationRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function readRequiredString(
  record: SpecificationRecord,
  field: string,
  index: number,
  maxLength: number,
): string {
  const value = record[field];

  if (typeof value !== 'string') {
    throw new BadRequestException(
      `Параметр №${index + 1}: поле "${field}" должно быть строкой`,
    );
  }

  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new BadRequestException(
      `Параметр №${index + 1}: поле "${field}" не может быть пустым`,
    );
  }

  if (normalized.length > maxLength) {
    throw new BadRequestException(
      `Параметр №${index + 1}: поле "${field}" слишком длинное`,
    );
  }

  return normalized;
}

function readOptionalString(
  record: SpecificationRecord,
  field: string,
  index: number,
  maxLength: number,
): string {
  const value = record[field];

  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return '';
  }

  if (typeof value !== 'string') {
    throw new BadRequestException(
      `Параметр №${index + 1}: поле "${field}" должно быть строкой`,
    );
  }

  const normalized = value.trim();

  if (normalized.length > maxLength) {
    throw new BadRequestException(
      `Параметр №${index + 1}: поле "${field}" слишком длинное`,
    );
  }

  return normalized;
}

export function parseProductSpecifications(
  value?: string,
): Prisma.InputJsonArray | undefined {
  if (value === undefined) {
    return undefined;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new BadRequestException(
      'Поле specifications содержит некорректный JSON',
    );
  }

  if (!Array.isArray(parsed)) {
    throw new BadRequestException(
      'Поле specifications должно содержать массив',
    );
  }

  if (
    parsed.length >
    MAX_SPECIFICATIONS
  ) {
    throw new BadRequestException(
      `Можно добавить не более ${MAX_SPECIFICATIONS} параметров`,
    );
  }

  const usedKeys = new Set<string>();

  return parsed.map((item, index) => {
    if (!isRecord(item)) {
      throw new BadRequestException(
        `Параметр №${index + 1} должен быть объектом`,
      );
    }

    const key = readRequiredString(
      item,
      'key',
      index,
      80,
    ).toLowerCase();

    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        key,
      )
    ) {
      throw new BadRequestException(
        `Параметр №${index + 1}: key может содержать только латинские буквы, цифры и дефисы`,
      );
    }

    if (usedKeys.has(key)) {
      throw new BadRequestException(
        `Параметр с key "${key}" указан несколько раз`,
      );
    }

    usedKeys.add(key);

    const specification:
      Prisma.InputJsonObject = {
        key,

        labelRu: readRequiredString(
          item,
          'labelRu',
          index,
          160,
        ),

        labelEn: readRequiredString(
          item,
          'labelEn',
          index,
          160,
        ),

        valueRu: readRequiredString(
          item,
          'valueRu',
          index,
          1_000,
        ),

        valueEn: readRequiredString(
          item,
          'valueEn',
          index,
          1_000,
        ),

        unitRu: readOptionalString(
          item,
          'unitRu',
          index,
          50,
        ),

        unitEn: readOptionalString(
          item,
          'unitEn',
          index,
          50,
        ),
      };

    return specification;
  });
}