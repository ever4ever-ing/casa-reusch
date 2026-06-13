"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type PhotoUploadProps = {
  modelId: string | null;
  modelName: string;
  accent: string;
  imageUrl?: string;
  imageVersion?: number;
  disabled?: boolean;
  onUploadFiles: (
    files: File[],
    onProgress?: (current: number, total: number) => void,
  ) => Promise<void>;
  pendingFiles: File[];
  onPendingFilesChange: (files: File[]) => void;
  isNew: boolean;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function withCacheBust(url: string, version: number): string {
  const base = url.split("?")[0];
  return `${base}?v=${version}`;
}

function filterImages(files: FileList | File[]): File[] {
  return Array.from(files).filter((f) => f.type.startsWith("image/") && f.size > 0);
}

export function PhotoUpload({
  modelId,
  modelName,
  accent,
  imageUrl,
  imageVersion = 0,
  disabled,
  onUploadFiles,
  pendingFiles,
  onPendingFilesChange,
  isNew,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const revokePreview = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  const setCoverPreview = useCallback(
    (file: File | null) => {
      revokePreview();
      if (!file) {
        setPreviewUrl(null);
        return;
      }
      const url = URL.createObjectURL(file);
      blobUrlRef.current = url;
      setPreviewUrl(url);
    },
    [revokePreview],
  );

  useEffect(() => {
    if (pendingFiles.length > 0) {
      setCoverPreview(pendingFiles[0]);
    } else if (!uploading) {
      revokePreview();
      setPreviewUrl(null);
    }
  }, [pendingFiles, uploading, setCoverPreview, revokePreview]);

  useEffect(() => () => revokePreview(), [revokePreview]);

  const serverUrl = imageUrl ? withCacheBust(imageUrl, imageVersion) : null;
  const displayUrl = previewUrl ?? serverUrl;

  const processFiles = useCallback(
    async (incoming: File[]) => {
      const files = filterImages(incoming);
      if (files.length === 0) return;

      if (isNew || !modelId) {
        onPendingFilesChange([...pendingFiles, ...files]);
        return;
      }

      setUploading(true);
      setUploadProgress({ current: 0, total: files.length });
      try {
        await onUploadFiles(files, (current, total) =>
          setUploadProgress({ current, total }),
        );
      } finally {
        setUploading(false);
        setUploadProgress({ current: 0, total: 0 });
      }
    },
    [isNew, modelId, onPendingFilesChange, onUploadFiles, pendingFiles],
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    processFiles(filterImages(e.dataTransfer.files));
  }

  function removePending(index: number) {
    onPendingFilesChange(pendingFiles.filter((_, i) => i !== index));
  }

  const statusLabel = uploading
    ? uploadProgress.total > 1
      ? `Subiendo ${uploadProgress.current}/${uploadProgress.total}...`
      : "Subiendo foto..."
    : pendingFiles.length > 0
      ? isNew
        ? `${pendingFiles.length} foto(s) · se suben al guardar`
        : `${pendingFiles.length} en cola`
      : serverUrl
        ? "Foto de portada"
        : "Sin fotos";

  return (
    <div className="mt-4">
      <p className="text-xs uppercase tracking-wider text-stone-500">
        Galería de fotos
      </p>

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
              : displayUrl || pendingFiles.length > 0
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-stone-700 bg-stone-950"
        }`}
      >
        <div
          className={`relative mx-auto aspect-square w-full max-w-[260px] bg-gradient-to-br ${accent}`}
        >
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayUrl}
              alt={modelName || "Foto"}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-stone-500">
              <span className="font-serif text-5xl text-white/20">
                {modelName.charAt(0) || "?"}
              </span>
              <span className="text-xs">Arrastra varias fotos aquí</span>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-[2px]">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400" />
              <span className="text-sm font-medium text-amber-100">{statusLabel}</span>
            </div>
          )}
        </div>

        <div className="border-t border-stone-800 p-3">
          <p className="mb-2 text-center text-xs text-stone-500">{statusLabel}</p>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            multiple
            className="hidden"
            disabled={disabled || uploading}
            onChange={(e) => {
              processFiles(filterImages(e.target.files ?? []));
              e.target.value = "";
            }}
          />

          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-lg bg-stone-800 py-2 text-xs font-medium text-amber-200 hover:bg-stone-700 disabled:opacity-50"
          >
            {displayUrl ? "Agregar más fotos" : "Elegir fotos (una o varias)"}
          </button>

          <p className="mt-2 text-center text-[10px] text-stone-600">
            JPG, PNG o WebP · máx. 5 MB c/u · selección múltiple
          </p>
        </div>
      </div>

      {pendingFiles.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-stone-500">
            {isNew ? "Pendientes de subir" : "Seleccionadas"} ({pendingFiles.length})
          </p>
          <div className="grid grid-cols-4 gap-2">
            {pendingFiles.map((file, index) => (
              <PendingThumb
                key={`${file.name}-${file.size}-${index}`}
                file={file}
                onRemove={() => removePending(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PendingThumb({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border border-stone-700">
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={file.name} className="h-full w-full object-cover" />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute inset-0 flex items-end justify-center bg-black/50 pb-1 text-[10px] text-red-300 opacity-0 transition group-hover:opacity-100"
      >
        Quitar
      </button>
      <span className="pointer-events-none absolute bottom-0 inset-x-0 truncate bg-black/60 px-1 text-[9px] text-stone-400">
        {formatFileSize(file.size)}
      </span>
    </div>
  );
}
