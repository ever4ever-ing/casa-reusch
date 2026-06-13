"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type PhotoUploadProps = {
  modelId: string | null;
  modelName: string;
  accent: string;
  imageUrl?: string;
  imageVersion?: number;
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

function withCacheBust(url: string, version: number): string {
  const base = url.split("?")[0];
  return `${base}?v=${version}`;
}

export function PhotoUpload({
  modelId,
  modelName,
  accent,
  imageUrl,
  imageVersion = 0,
  disabled,
  onUpload,
  pendingFile,
  onPendingFile,
  onPreviewChange,
  isNew,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);

  const revokeBlob = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  const setLocalPreview = useCallback(
    (file: File | null) => {
      revokeBlob();
      if (!file) {
        setBlobUrl(null);
        setSelectedFile(null);
        onPreviewChange?.(null);
        return;
      }
      const url = URL.createObjectURL(file);
      blobUrlRef.current = url;
      setBlobUrl(url);
      setSelectedFile(file);
      setUploadDone(false);
      onPreviewChange?.(file);
    },
    [revokeBlob, onPreviewChange],
  );

  useEffect(() => {
    if (pendingFile) setLocalPreview(pendingFile);
  }, [pendingFile, setLocalPreview]);

  useEffect(() => () => revokeBlob(), [revokeBlob]);

  // Solo quitar el blob cuando ya tenemos URL del servidor
  useEffect(() => {
    if (uploadDone && imageUrl && blobUrl) {
      revokeBlob();
      setBlobUrl(null);
      setSelectedFile(null);
    }
  }, [uploadDone, imageUrl, blobUrl, revokeBlob]);

  const serverUrl = imageUrl ? withCacheBust(imageUrl, imageVersion) : null;
  const displayUrl = blobUrl ?? serverUrl;

  const pickFile = useCallback(
    async (file: File | undefined) => {
      if (!file || !file.type.startsWith("image/")) return;

      setLocalPreview(file);

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
    [isNew, modelId, onPendingFile, onUpload, setLocalPreview],
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    pickFile(e.dataTransfer.files[0]);
  }

  function handleClear() {
    onPendingFile(null);
    setUploadDone(false);
    setLocalPreview(null);
  }

  const statusLabel = uploading
    ? "Subiendo foto..."
    : uploadDone && serverUrl
      ? "Foto guardada"
      : blobUrl
        ? isNew
          ? "Vista previa · se sube al guardar"
          : "Vista previa"
        : serverUrl
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
              : displayUrl
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
              {selectedFile && (
                <span className="max-w-[90%] truncate text-xs text-stone-400">
                  {selectedFile.name}
                </span>
              )}
            </div>
          )}

          {selectedFile && blobUrl && !uploading && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
              <p className="truncate text-xs font-medium text-white">{selectedFile.name}</p>
              <p className="text-[10px] text-stone-400">{formatFileSize(selectedFile.size)}</p>
            </div>
          )}
        </div>

        <div className="border-t border-stone-800 p-3">
          <p
            className={`mb-2 text-center text-xs ${
              uploading
                ? "text-amber-300"
                : uploadDone && serverUrl
                  ? "text-emerald-400"
                  : displayUrl
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
            {(blobUrl || selectedFile) && (
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
            JPG, PNG o WebP · máx. 5 MB
          </p>
        </div>
      </div>
    </div>
  );
}
