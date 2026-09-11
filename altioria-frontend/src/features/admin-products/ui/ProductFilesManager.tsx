import {
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router';

import { DragDropProvider } from '@dnd-kit/react';
import {
  isSortable,
  useSortable,
} from '@dnd-kit/react/sortable';

import {
  deleteAdminProductFile,
} from '../api/delete-admin-product-file';

import {
  AdminProductsApiError,
  type AdminProductFile,
} from '../api/get-admin-products';

import {
  reorderAdminProductFiles,
} from '../api/reorder-admin-product-files';

import {
  updateAdminProductFile,
  type UpdateAdminProductFileInput,
} from '../api/update-admin-product-file';

interface ProductFilesManagerProps {
  productId: string;
  files: AdminProductFile[];
  onFilesChange: (
    files: AdminProductFile[],
  ) => void;
}

interface SortableFileProps {
  file: AdminProductFile;
  index: number;
  isDragLocked: boolean;
  isBusy: boolean;
  isEditing: boolean;
  isConfirmingDelete: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSave: (
    input: UpdateAdminProductFileInput,
  ) => void;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}

const inputClass =
  'h-10 w-full select-text rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/25 disabled:opacity-40';

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} Б`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)} КБ`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

function DragHandleIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <circle
        cx="6"
        cy="5"
        r="1.2"
        fill="currentColor"
      />
      <circle
        cx="14"
        cy="5"
        r="1.2"
        fill="currentColor"
      />
      <circle
        cx="6"
        cy="10"
        r="1.2"
        fill="currentColor"
      />
      <circle
        cx="14"
        cy="10"
        r="1.2"
        fill="currentColor"
      />
      <circle
        cx="6"
        cy="15"
        r="1.2"
        fill="currentColor"
      />
      <circle
        cx="14"
        cy="15"
        r="1.2"
        fill="currentColor"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="M14.5 5.5l4 4M6 18l2.3-5.2L16.8 4.3a1.4 1.4 0 012 0l.9.9a1.4 1.4 0 010 2l-8.5 8.5L6 18z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="M5 7h14M9 7V4.5h6V7M7.5 7l.7 12h7.6l.7-12M10 10.5v5M14 10.5v5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function SortableFile({
  file,
  index,
  isDragLocked,
  isBusy,
  isEditing,
  isConfirmingDelete,
  onStartEditing,
  onCancelEditing,
  onSave,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: SortableFileProps) {
  const [labelRu, setLabelRu] = useState(
    file.labelRu ?? '',
  );

  const [labelEn, setLabelEn] = useState(
    file.labelEn ?? '',
  );

  const {
    ref,
    handleRef,
    isDragSource,
  } = useSortable({
    id: file.id,
    index,
    disabled: isDragLocked,
  });

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    setLabelRu(file.labelRu ?? '');
    setLabelEn(file.labelEn ?? '');
  }, [
    file.labelEn,
    file.labelRu,
    isEditing,
  ]);

  function saveLabels(): void {
    onSave({
      labelRu: labelRu.trim() || null,
      labelEn: labelEn.trim() || null,
    });
  }

  return (
    <article
      ref={ref}
      className={`relative overflow-hidden rounded-2xl border bg-white/[0.025] transition-[border-color,opacity,transform] duration-200 ${
        isDragSource
          ? 'z-30 scale-[1.01] border-white/30 opacity-80 shadow-[0_1.5rem_3rem_rgba(0,0,0,0.45)]'
          : 'border-white/[0.08]'
      }`}
    >
      <div className="flex items-center gap-3 p-3 sm:gap-4">
        <button
          ref={handleRef}
          type="button"
          disabled={isDragLocked}
          aria-label={`Переместить файл, текущая позиция ${index + 1}`}
          title="Перетащить файл"
          className="flex h-10 shrink-0 cursor-grab touch-none items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 text-xs text-white/35 transition-colors hover:bg-white/[0.07] hover:text-white active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
        >
          <DragHandleIcon />

          <span>{index + 1}</span>
        </button>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.055] text-[0.65rem] font-medium uppercase text-white/50">
          {file.type === 'MODEL_3D'
            ? '3D'
            : 'PDF'}
        </span>

        <div className="min-w-0 flex-1">
          <a
            href={file.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="block truncate text-sm text-white/70 transition-colors hover:text-white"
          >
            {file.labelRu ?? file.originalName}
          </a>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/25">
            <span className="truncate">
              {file.originalName}
            </span>

            <span>·</span>

            <span>
              {formatBytes(file.sizeBytes)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            disabled={
              isDragLocked && !isEditing
            }
            aria-label="Изменить подписи файла"
            title="Изменить подписи"
            onClick={onStartEditing}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/35 transition-colors hover:bg-white/[0.07] hover:text-white disabled:opacity-30"
          >
            <EditIcon />
          </button>

          <button
            type="button"
            disabled={isDragLocked}
            aria-label="Удалить файл"
            title="Удалить файл"
            onClick={onRequestDelete}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-[#d99595]/10 hover:text-[#e4aaaa] disabled:opacity-30"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="border-t border-white/[0.07] bg-black/15 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.12em] text-white/30">
                Подпись на русском
              </span>

              <input
                autoFocus
                type="text"
                value={labelRu}
                maxLength={160}
                disabled={isBusy}
                placeholder="Например: Каталог товара"
                onChange={(event) =>
                  setLabelRu(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    onCancelEditing();
                  }
                }}
                className={inputClass}
              />
            </label>

            <label>
              <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.12em] text-white/30">
                Подпись на английском
              </span>

              <input
                type="text"
                value={labelEn}
                maxLength={160}
                disabled={isBusy}
                placeholder="For example: Product catalogue"
                onChange={(event) =>
                  setLabelEn(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    onCancelEditing();
                  }
                }}
                className={inputClass}
              />
            </label>
          </div>

          <p className="mt-2 text-xs text-white/20">
            Оставьте поле пустым, чтобы удалить
            соответствующую подпись.
          </p>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={onCancelEditing}
              className="h-9 rounded-lg border border-white/10 px-3 text-xs text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white disabled:opacity-30"
            >
              Отмена
            </button>

            <button
              type="button"
              disabled={isBusy}
              onClick={saveLabels}
              className="flex h-9 min-w-28 items-center justify-center gap-2 rounded-lg bg-white px-3 text-xs font-medium text-black transition-colors hover:bg-[#d5d5d5] disabled:opacity-40"
            >
              {isBusy && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
              )}

              {isBusy
                ? 'Сохранение'
                : 'Сохранить'}
            </button>
          </div>
        </div>
      )}

      {isConfirmingDelete && (
        <div className="border-t border-[#d99595]/15 bg-[#d99595]/[0.045] p-4">
          <p className="text-sm text-[#e4aaaa]/80">
            Удалить файл «{file.originalName}»?
          </p>

          <p className="mt-1 text-xs text-white/25">
            Файл будет удалён из базы и хранилища.
          </p>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={onCancelDelete}
              className="h-9 rounded-lg border border-white/10 px-3 text-xs text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white disabled:opacity-30"
            >
              Отмена
            </button>

            <button
              type="button"
              disabled={isBusy}
              onClick={onConfirmDelete}
              className="flex h-9 min-w-28 items-center justify-center gap-2 rounded-lg bg-[#d99595] px-3 text-xs font-medium text-[#1a0e0e] transition-colors hover:bg-[#e6aaaa] disabled:opacity-40"
            >
              {isBusy && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
              )}

              {isBusy
                ? 'Удаление'
                : 'Удалить'}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export function ProductFilesManager({
  productId,
  files,
  onFilesChange,
}: ProductFilesManagerProps) {
  const navigate = useNavigate();

  const [isSavingOrder, setIsSavingOrder] =
    useState(false);

  const [editingFileId, setEditingFileId] =
    useState<string | null>(null);

  const [
    confirmingDeleteId,
    setConfirmingDeleteId,
  ] = useState<string | null>(null);

  const [activeRequestId, setActiveRequestId] =
    useState<string | null>(null);

  const [error, setError] = useState<
    string | null
  >(null);

  const isDragLocked =
    isSavingOrder ||
    activeRequestId !== null ||
    editingFileId !== null ||
    confirmingDeleteId !== null;

  async function saveOrder(
    previousFiles: AdminProductFile[],
    reorderedFiles: AdminProductFile[],
  ): Promise<void> {
    setIsSavingOrder(true);
    setError(null);

    onFilesChange(reorderedFiles);

    try {
      const savedFiles =
        await reorderAdminProductFiles(
          productId,
          reorderedFiles.map(
            (file) => file.id,
          ),
        );

      onFilesChange(savedFiles);
    } catch (requestError: unknown) {
      onFilesChange(previousFiles);

      if (
        requestError instanceof
          AdminProductsApiError &&
        requestError.status === 401
      ) {
        navigate('/admin/login', {
          replace: true,
        });

        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Не удалось сохранить порядок файлов',
      );
    } finally {
      setIsSavingOrder(false);
    }
  }

  async function saveFileLabels(
    fileId: string,
    input: UpdateAdminProductFileInput,
  ): Promise<void> {
    const currentFile = files.find(
      (file) => file.id === fileId,
    );

    if (!currentFile) {
      return;
    }

    if (
      input.labelRu === currentFile.labelRu &&
      input.labelEn === currentFile.labelEn
    ) {
      setEditingFileId(null);
      return;
    }

    setActiveRequestId(fileId);
    setError(null);

    try {
      const updatedFile =
        await updateAdminProductFile(
          productId,
          fileId,
          input,
        );

      onFilesChange(
        files.map((file) =>
          file.id === fileId
            ? updatedFile
            : file,
        ),
      );

      setEditingFileId(null);
    } catch (requestError: unknown) {
      if (
        requestError instanceof
          AdminProductsApiError &&
        requestError.status === 401
      ) {
        navigate('/admin/login', {
          replace: true,
        });

        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Не удалось сохранить подписи',
      );
    } finally {
      setActiveRequestId(null);
    }
  }

  async function removeFile(
    fileId: string,
  ): Promise<void> {
    setActiveRequestId(fileId);
    setError(null);

    try {
      await deleteAdminProductFile(
        productId,
        fileId,
      );

      onFilesChange(
        files.filter(
          (file) => file.id !== fileId,
        ),
      );

      setConfirmingDeleteId(null);
    } catch (requestError: unknown) {
      if (
        requestError instanceof
          AdminProductsApiError &&
        requestError.status === 401
      ) {
        navigate('/admin/login', {
          replace: true,
        });

        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Не удалось удалить файл',
      );
    } finally {
      setActiveRequestId(null);
    }
  }

  if (files.length === 0) {
    return (
      <div className="mb-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-5 py-8 text-center">
        <p className="text-sm text-white/35">
          У товара пока нет сохранённых файлов
        </p>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-white/30">
            Текущие файлы
          </p>

          <p className="mt-1 text-xs text-white/20">
            Перетащите файл за кнопку с точками
          </p>
        </div>

        {isSavingOrder && (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/45">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/15 border-t-white/60" />

            Сохранение порядка
          </span>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-[#d99595]/20 bg-[#d99595]/[0.06] px-4 py-3"
        >
          <p className="text-sm text-[#e4aaaa]">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 text-xs text-white/45 transition-colors hover:text-white"
          >
            Закрыть
          </button>
        </div>
      )}

      <DragDropProvider
        onDragEnd={(event) => {
          if (
            event.canceled ||
            isDragLocked
          ) {
            return;
          }

          const { source } = event.operation;

          if (!isSortable(source)) {
            return;
          }

          const {
            initialIndex,
            index,
          } = source;

          if (initialIndex === index) {
            return;
          }

          const previousFiles = [...files];
          const reorderedFiles = [...files];

          const [movedFile] =
            reorderedFiles.splice(
              initialIndex,
              1,
            );

          if (!movedFile) {
            return;
          }

          reorderedFiles.splice(
            index,
            0,
            movedFile,
          );

          void saveOrder(
            previousFiles,
            reorderedFiles,
          );
        }}
      >
        <div className="space-y-2">
          {files.map((file, index) => (
            <SortableFile
              key={file.id}
              file={file}
              index={index}
              isDragLocked={isDragLocked}
              isBusy={
                activeRequestId === file.id
              }
              isEditing={
                editingFileId === file.id
              }
              isConfirmingDelete={
                confirmingDeleteId === file.id
              }
              onStartEditing={() => {
                setError(null);
                setConfirmingDeleteId(null);
                setEditingFileId(file.id);
              }}
              onCancelEditing={() =>
                setEditingFileId(null)
              }
              onSave={(input) =>
                void saveFileLabels(
                  file.id,
                  input,
                )
              }
              onRequestDelete={() => {
                setError(null);
                setEditingFileId(null);
                setConfirmingDeleteId(
                  file.id,
                );
              }}
              onCancelDelete={() =>
                setConfirmingDeleteId(null)
              }
              onConfirmDelete={() =>
                void removeFile(file.id)
              }
            />
          ))}
        </div>
      </DragDropProvider>

      <p className="mt-3 text-xs leading-relaxed text-white/20">
        Порядок, подписи и удаление сохраняются
        сразу, независимо от кнопки «Сохранить
        изменения» внизу формы.
      </p>
    </div>
  );
}