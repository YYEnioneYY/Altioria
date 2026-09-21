import type {
  ProductSpecification,
} from '../types/product-specification';

interface AdminProductSpecificationsListProps {
  specifications: ProductSpecification[];
  emptyText?: string;
}

function formatValue(
  value: string,
  unit: string,
): string {
  const normalizedValue = value.trim();
  const normalizedUnit = unit.trim();

  return normalizedUnit
    ? `${normalizedValue} ${normalizedUnit}`
    : normalizedValue;
}

export function AdminProductSpecificationsList({
  specifications,
  emptyText = 'Дополнительные параметры не указаны',
}: AdminProductSpecificationsListProps) {
  if (specifications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 px-5 py-8 text-center text-sm text-white/25">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {specifications.map(
        (specification, index) => (
          <article
            key={specification.key}
            className="rounded-2xl border border-white/[0.08] bg-black/10 p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] pb-4">
              <div className="min-w-0">
                <h3 className="break-words text-sm font-medium text-white/75">
                  {specification.labelRu}
                </h3>

                <p className="mt-1 break-words text-xs text-white/30">
                  {specification.labelEn}
                </p>
              </div>

              <span className="shrink-0 rounded-lg border border-white/[0.07] bg-white/[0.035] px-2 py-1 text-[0.65rem] text-white/25">
                #{index + 1}
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.12em] text-white/20">
                  Русский
                </p>

                <p className="mt-1.5 break-words text-sm text-white/65">
                  {formatValue(
                    specification.valueRu,
                    specification.unitRu,
                  )}
                </p>
              </div>

              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.12em] text-white/20">
                  English
                </p>

                <p className="mt-1.5 break-words text-sm text-white/65">
                  {formatValue(
                    specification.valueEn,
                    specification.unitEn,
                  )}
                </p>
              </div>
            </div>

            <code className="mt-4 block truncate text-[0.65rem] text-white/15">
              {specification.key}
            </code>
          </article>
        ),
      )}
    </div>
  );
}