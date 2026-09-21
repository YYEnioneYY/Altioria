import {
  createProductSpecification,
  type ProductSpecification,
} from '../types/product-specification';

interface ProductSpecificationsEditorProps {
  value: ProductSpecification[];
  disabled?: boolean;
  emptyDescription?: string;
  onChange: (
    value: ProductSpecification[],
  ) => void;
}

type SpecificationField =
  | 'labelRu'
  | 'labelEn'
  | 'valueRu'
  | 'valueEn'
  | 'unitRu'
  | 'unitEn';

const inputClass =
  'h-11 w-full rounded-xl border border-white/10 bg-black/15 px-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/20 hover:bg-white/[0.035] focus:border-white/25 focus:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40';

export function ProductSpecificationsEditor({
  value,
  disabled = false,
  emptyDescription = 'Добавьте параметры, которые нельзя описать стандартными полями.',
  onChange,
}: ProductSpecificationsEditorProps) {
  function addSpecification(): void {
    if (value.length >= 50) {
      return;
    }

    onChange([
      ...value,
      createProductSpecification(value),
    ]);
  }

  function updateSpecification(
    index: number,
    field: SpecificationField,
    fieldValue: string,
  ): void {
    onChange(
      value.map((specification, itemIndex) =>
        itemIndex === index
          ? {
              ...specification,
              [field]: fieldValue,
            }
          : specification,
      ),
    );
  }

  function removeSpecification(
    index: number,
  ): void {
    onChange(
      value.filter(
        (_, itemIndex) =>
          itemIndex !== index,
      ),
    );
  }

  return (
    <div>
      {value.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 px-5 py-8 text-center">
          <p className="text-sm text-white/35">
            Дополнительные параметры пока не
            добавлены
          </p>

          <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-white/20">
            {emptyDescription}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {value.map(
            (specification, index) => (
              <article
                key={specification.key}
                className="rounded-2xl border border-white/[0.08] bg-black/10 p-4 sm:p-5"
              >
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white/70">
                      Параметр {index + 1}
                    </p>

                    <p className="mt-1 font-mono text-[0.65rem] text-white/20">
                      {specification.key}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      removeSpecification(index)
                    }
                    className="flex h-9 items-center justify-center rounded-xl border border-[#d99595]/15 bg-[#d99595]/[0.06] px-3 text-xs text-[#e4aaaa]/70 transition-colors hover:bg-[#d99595]/15 hover:text-[#e4aaaa] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Удалить
                  </button>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs text-white/40">
                      Название на русском *
                    </span>

                    <input
                      type="text"
                      value={
                        specification.labelRu
                      }
                      disabled={disabled}
                      placeholder="Например: Вес"
                      onChange={(event) =>
                        updateSpecification(
                          index,
                          'labelRu',
                          event.target.value,
                        )
                      }
                      className={inputClass}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs text-white/40">
                      Название на английском *
                    </span>

                    <input
                      type="text"
                      value={
                        specification.labelEn
                      }
                      disabled={disabled}
                      placeholder="For example: Weight"
                      onChange={(event) =>
                        updateSpecification(
                          index,
                          'labelEn',
                          event.target.value,
                        )
                      }
                      className={inputClass}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs text-white/40">
                      Значение на русском *
                    </span>

                    <input
                      type="text"
                      value={
                        specification.valueRu
                      }
                      disabled={disabled}
                      placeholder="Например: 45"
                      onChange={(event) =>
                        updateSpecification(
                          index,
                          'valueRu',
                          event.target.value,
                        )
                      }
                      className={inputClass}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs text-white/40">
                      Значение на английском *
                    </span>

                    <input
                      type="text"
                      value={
                        specification.valueEn
                      }
                      disabled={disabled}
                      placeholder="For example: 45"
                      onChange={(event) =>
                        updateSpecification(
                          index,
                          'valueEn',
                          event.target.value,
                        )
                      }
                      className={inputClass}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs text-white/40">
                      Единица на русском
                    </span>

                    <input
                      type="text"
                      value={
                        specification.unitRu
                      }
                      disabled={disabled}
                      placeholder="Например: кг"
                      onChange={(event) =>
                        updateSpecification(
                          index,
                          'unitRu',
                          event.target.value,
                        )
                      }
                      className={inputClass}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs text-white/40">
                      Единица на английском
                    </span>

                    <input
                      type="text"
                      value={
                        specification.unitEn
                      }
                      disabled={disabled}
                      placeholder="For example: kg"
                      onChange={(event) =>
                        updateSpecification(
                          index,
                          'unitEn',
                          event.target.value,
                        )
                      }
                      className={inputClass}
                    />
                  </label>
                </div>
              </article>
            ),
          )}
        </div>
      )}

      <button
        type="button"
        disabled={
          disabled || value.length >= 50
        }
        onClick={addSpecification}
        className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="text-lg leading-none">
          +
        </span>

        Добавить параметр
      </button>

      <span className="ml-3 text-xs text-white/20">
        {value.length} / 50
      </span>
    </div>
  );
}