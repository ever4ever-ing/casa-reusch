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
  isNew: boolean;
};

export function PhotoUpload({
  modelId,
  modelName,
  accent,
  imageUrl,
  disabled,
  onUpload,
  pendingFile,
  onPendingFile,
  isNew,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!pendingFile) {
      setLocalPreview(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setLocalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const previewSrc = localPreview ?? (imageUrl ? `${imageUrl}?v=${imageUrl.length}` : null);

  const pickFile = useCallback(
    async (file: File | undefined) => {
      if (!file || !file.type.startsWith("image/")) return;

      if (isNew || !modelId) {
        onPendingFile(file);
        return;
      }

      setUploading(true);
      try {
        await onUpload(file);
      } finally {
        setUploading(false);
      }
    },
    [isNew, modelId, onPendingFile, onUpload],
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    pickFile(e.dataTransfer.files[0]);
  }

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
            : "border-stone-700 bg-stone-950"
        }`}
      >
        <div className={`relative mx-auto aspect-square w-full max-w-[220px] bg-gradient-to-br ${accent}`}>
          {previewSrc ? (
            <Image
              src={previewSrc}
              alt={modelName || "Preview"}
              fill
              className="object-cover"
              sizes="220px"
              unoptimized
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-stone-500">
              <span className="font-serif text-5xl text-white/20">
                {modelName.charAt(0) || "?"}
              </span>
              <span className="text-xs">Sin foto</span>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-amber-200">
              Subiendo...
            </div>
          )}
        </div>

        <div className="border-t border-stone-800 p-3">
          {isNew ? (
            <p className="mb-2 text-center text-xs text-stone-500">
              {pendingFile
                ? "La foto se subirá al guardar la modelo"
                : "Puedes elegir la foto ahora; se sube al guardar"}
            </p>
          ) : (
            <p className="mb-2 text-center text-xs text-stone-500">
              Arrastra una imagen o usa el botón para reemplazar la foto
            </p>
          )}

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
              {previewSrc ? "Cambiar foto" : "Subir foto"}
            </button>
            {(pendingFile || (previewSrc && !isNew)) && (
              <button
                type="button"
                disabled={disabled || uploading}
                onClick={() => {
                  onPendingFile(null);
                  if (!isNew) inputRef.current?.click();
                }}
                className="rounded-lg border border-stone-700 px-3 py-2 text-xs text-stone-400 hover:text-stone-200 disabled:opacity-50"
              >
                {pendingFile ? "Quitar" : "Nueva"}
              </button>
            )}
          </div>

          <p className="mt-2 text-center text-[10px] text-stone-600">
            JPG, PNG o WebP · máx. 5 MB
          </p>
        </div>
      </div>
    </div>
  );
}
