export interface ProductSpecification {
  key: string;

  labelRu: string;
  labelEn: string;

  valueRu: string;
  valueEn: string;

  unitRu: string;
  unitEn: string;
}

export function createProductSpecification(
  current: ProductSpecification[],
): ProductSpecification {
  let index = current.length + 1;
  let key = `parameter-${index}`;

  const existingKeys = new Set(
    current.map(
      (specification) =>
        specification.key,
    ),
  );

  while (existingKeys.has(key)) {
    index += 1;
    key = `parameter-${index}`;
  }

  return {
    key,
    labelRu: '',
    labelEn: '',
    valueRu: '',
    valueEn: '',
    unitRu: '',
    unitEn: '',
  };
}

export function validateProductSpecifications(
  specifications: ProductSpecification[],
): string | null {
  if (specifications.length > 50) {
    return 'Можно добавить не более 50 дополнительных параметров';
  }

  for (
    let index = 0;
    index < specifications.length;
    index += 1
  ) {
    const specification =
      specifications[index];

    if (
      !specification.labelRu.trim() ||
      !specification.labelEn.trim()
    ) {
      return `Параметр №${index + 1}: укажите название на русском и английском`;
    }

    if (
      !specification.valueRu.trim() ||
      !specification.valueEn.trim()
    ) {
      return `Параметр №${index + 1}: укажите значение на русском и английском`;
    }
  }

  return null;
}

export function normalizeProductSpecifications(
  specifications: ProductSpecification[],
): ProductSpecification[] {
  return specifications.map(
    (specification) => ({
      key: specification.key,
      labelRu:
        specification.labelRu.trim(),
      labelEn:
        specification.labelEn.trim(),
      valueRu:
        specification.valueRu.trim(),
      valueEn:
        specification.valueEn.trim(),
      unitRu:
        specification.unitRu.trim(),
      unitEn:
        specification.unitEn.trim(),
    }),
  );
}