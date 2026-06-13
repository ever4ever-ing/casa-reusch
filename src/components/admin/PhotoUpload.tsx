"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type PhotoUploadProps = {
  modelId: string | null;
  modelName: string;
  accent: string;
  imageUrl?: string;
  disabled?: boolean;
  onUpload: (file: File) => Promise<void>;
  pendingFile: File | null;
  onPendingFile: (file: File | null) => void;
  onPreviewChange?: (file: File | null) => void;
  isNew: boolean;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PhotoUpload({
  modelId,
  modelName,
  accent,
  imageUrl,
  disabled,
  onUpload,
  pendingFile,
  onPendingFile,
  onPreviewChange,
  isNew,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);

  const revokePreview = useCallback(() => {
    if (previewUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = null;
  }, []);

  const showPreview = useCallback(
    (file: File) => {
      revokePreview();
      const url = URL.createObjectURL(file);
      previewUrlRef.current = url;
      setPreviewUrl(url);
      setPreviewFile(file);
      setUploadDone(false);
      onPreviewChange?.(file);
    },
    [revokePreview, onPreviewChange],
  );

  const clearPreview = useCallback(() => {
    revokePreview();
    setPreviewUrl(null);
    setPreviewFile(null);
    setUploadDone(false);
    onPreviewChange?.(null);
  }, [revokePreview, onPreviewChange]);

  useEffect(() => {
    if (pendingFile) {
      showPreview(pendingFile);
    } else if (!uploading && !previewFile) {
      clearPreview();
    }
  }, [pendingFile, showPreview, clearPreview, uploading, previewFile]);

  useEffect(() => {
    return () => revokePreview();
  }, [revokePreview]);

  // Cuando el servidor devuelve la URL, reemplazar el blob por la foto guardada
  useEffect(() => {
    if (!pendingFile && !uploading && imageUrl && previewFile) {
      clearPreview();
      setUploadDone(true);
    }
  }, [imageUrl, pendingFile, uploading, previewFile, clearPreview]);

  // Tras subir en modelo existente, limpiar blob si ya hay URL remota
  useEffect(() => {
    if (uploadDone && imageUrl && previewUrl?.startsWith("blob:")) {
      revokePreview();
      setPreviewUrl(null);
      setPreviewFile(null);
    }
  }, [uploadDone, imageUrl, previewUrl, revokePreview]);

  const displayUrl = previewUrl ?? imageUrl ?? null;
  const isBlobPreview = displayUrl?.startsWith("blob:") ?? false;

  const pickFile = useCallback(
    async (file: File | undefined) => {
      if (!file || !file.type.startsWith("image/")) return;

      showPreview(file);

      if (isNew || !modelId) {
        onPendingFile(file);
        return;
      }

      setUploading(true);
      try {
        await onUpload(file);
        setUploadDone(true);
      } finally {
        setUploading(false);
      }
    },
    [isNew, modelId, onPendingFile, onUpload, showPreview],
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    pickFile(e.dataTransfer.files[0]);
  }

  function handleClear() {
    onPendingFile(null);
    clearPreview();
  }

  const statusLabel = uploading
    ? "Subiendo foto..."
    : uploadDone
      ? "Foto guardada"
      : previewFile
        ? isNew
          ? "Vista previa · se sube al guardar"
          : "Vista previa"
        : imageUrl
          ? "Foto actual"
          : "Sin foto";

  return (
    <div className="mt-4">
      <p className="text-xs uppercase tracking-wider text-stone-500">Foto de la modelo</p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative mt-2 overflow-hidden rounded-xl border-2 border-dashed transition ${
          dragOver
            ? "border-amber-400 bg-amber-400/5"
            : uploading
              ? "border-amber-400/60 bg-amber-400/5"
              : previewFile
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-stone-700 bg-stone-950"
        }`}
      >
        <div
          className={`relative mx-auto aspect-square w-full max-w-[260px] bg-gradient-to-br ${accent}`}
        >
          {displayUrl ? (
            isBlobPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayUrl}
                alt={modelName || "Vista previa"}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <Image
                src={displayUrl}
                alt={modelName || "Foto"}
                fill
                className="object-cover"
                sizes="260px"
                unoptimized
              />
            )
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-stone-500">
              <span className="font-serif text-5xl text-white/20">
                {modelName.charAt(0) || "?"}
              </span>
              <span className="text-xs">Sin foto</span>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-[2px]">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400" />
              <span className="text-sm font-medium text-amber-100">Subiendo...</span>
              {previewFile && (
                <span className="max-w-[90%] truncate text-xs text-stone-400">
                  {previewFile.name}
                </span>
              )}
              <div className="mx-6 h-1 w-full max-w-[180px] overflow-hidden rounded-full bg-stone-800">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-amber-400" />
              </div>
            </div>
          )}

          {previewFile && !uploading && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
              <p className="truncate text-xs font-medium text-white">{previewFile.name}</p>
              <p className="text-[10px] text-stone-400">{formatFileSize(previewFile.size)}</p>
            </div>
          )}
        </div>

        <div className="border-t border-stone-800 p-3">
          <p
            className={`mb-2 text-center text-xs ${
              uploading
                ? "text-amber-300"
                : uploadDone
                  ? "text-emerald-400"
                  : previewFile
                    ? "text-emerald-400/80"
                    : "text-stone-500"
            }`}
          >
            {statusLabel}
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
            disabled={disabled || uploading}
            onChange={(e) => {
              pickFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          <div className="flex gap-2">
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
              className="flex-1 rounded-lg bg-stone-800 py-2 text-xs font-medium text-amber-200 hover:bg-stone-700 disabled:opacity-50"
            >
              {displayUrl ? "Cambiar foto" : "Elegir foto"}
            </button>
            {previewFile && (
              <button
                type="button"
                disabled={disabled || uploading}
                onClick={handleClear}
                className="rounded-lg border border-stone-700 px-3 py-2 text-xs text-stone-400 hover:text-stone-200 disabled:opacity-50"
              >
                Quitar
              </button>
            )}
          </div>

          <p className="mt-2 text-center text-[10px] text-stone-600">
            JPG, PNG o WebP · máx. 5 MB · la vista previa aparece al instante
          </p>
        </div>
      </div>
    </div>
  );
}
