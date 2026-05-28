"use client";

import { useRef, useState, useTransition } from "react";
import { updateProfileImageAction } from "@/actions/profile";
import { getInitials } from "@/lib/utils";

interface Props {
  currentImage: string | null;
  name: string | null;
}

export function ProfileImageUpload({ currentImage, name }: Props) {
  const [preview, setPreview] = useState<string | null>(currentImage);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Solo se admiten imágenes");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar 5 MB");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "gamemate_avatars");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dingonhnt/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("Error al subir la imagen");

      const data = await res.json();
      const url: string = data.secure_url;

      setPreview(url);

      startTransition(async () => {
        const result = await updateProfileImageAction(url);
        if (result.error) setError(result.error);
      });
    } catch {
      setError("No se pudo subir la imagen. Inténtalo de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || isPending}
        className="relative w-16 h-16 rounded-full overflow-hidden group focus:outline-none focus:ring-2 focus:ring-indigo-500"
        title="Cambiar foto de perfil"
      >
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
            {getInitials(name)}
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading || isPending ? (
            <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <span className="text-white text-xs font-medium">📷</span>
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {error && (
        <p className="absolute top-full left-0 mt-1 text-xs text-red-400 whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  );
}
