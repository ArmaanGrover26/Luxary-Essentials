"use client";

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import Image from "next/image";
import { X, Upload, ImagePlus, Loader2 } from "lucide-react";

interface UploadedImage {
  url: string;
  publicId: string;
  uploading?: boolean;
  error?: string;
  localPreview?: string; // for instant preview before upload completes
}

interface CloudinaryImageUploaderProps {
  images: string[]; // current saved URLs
  onChange: (urls: string[]) => void; // called when images list changes
  maxImages?: number;
}

export default function CloudinaryImageUploader({
  images,
  onChange,
  maxImages = 6,
}: CloudinaryImageUploaderProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(
    images.map((url) => ({ url, publicId: url }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep parent state in sync
  const syncParent = useCallback(
    (list: UploadedImage[]) => {
      const urls = list
        .filter((img) => img.url && !img.uploading && !img.error)
        .map((img) => img.url);
      onChange(urls);
    },
    [onChange]
  );

  const uploadToCloudinary = async (file: File, index: number) => {
    // 1. Get signed credentials from our API route (admin authenticated via HttpOnly cookie)
    const signRes = await fetch("/api/cloudinary/sign-upload", { credentials: "include" });
    if (!signRes.ok) {
      const errData = await signRes.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to get upload signature (Admin required)");
    }
    const { signature, timestamp, cloudName, apiKey, folder } =
      await signRes.json();

    // 2. Build FormData for direct browser → Cloudinary upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("signature", signature);
    formData.append("timestamp", timestamp.toString());
    formData.append("api_key", apiKey);
    formData.append("folder", folder);
    formData.append("transformation", "q_auto,f_auto");

    // 3. POST directly to Cloudinary
    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );
    if (!uploadRes.ok) {
      const err = await uploadRes.json();
      throw new Error(err.error?.message || "Upload failed");
    }
    const result = await uploadRes.json();
    return { url: result.secure_url as string, publicId: result.public_id as string };
  };

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remaining = maxImages - uploadedImages.filter((i) => !i.error).length;
      const toProcess = Array.from(files).slice(0, remaining);
      if (toProcess.length === 0) return;

      // Create pending entries with local previews
      const pending: UploadedImage[] = toProcess.map((file) => ({
        url: "",
        publicId: "",
        uploading: true,
        localPreview: URL.createObjectURL(file),
      }));

      const updated = [...uploadedImages, ...pending];
      setUploadedImages(updated);

      // Upload each file in parallel
      await Promise.all(
        toProcess.map(async (file, i) => {
          const idx = uploadedImages.length + i;
          try {
            const { url, publicId } = await uploadToCloudinary(file, idx);
            setUploadedImages((prev) => {
              const next = [...prev];
              if (next[idx]) {
                next[idx] = { url, publicId, uploading: false };
              }
              syncParent(next);
              return next;
            });
          } catch (err) {
            setUploadedImages((prev) => {
              const next = [...prev];
              if (next[idx]) {
                next[idx] = {
                  ...next[idx],
                  url: "",
                  uploading: false,
                  error:
                    err instanceof Error ? err.message : "Upload failed",
                };
              }
              return next;
            });
          }
        })
      );
    },
    [uploadedImages, maxImages, syncParent]
  );

  const removeImage = (index: number) => {
    const next = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(next);
    syncParent(next);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset so same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canAddMore = uploadedImages.filter((i) => !i.error).length < maxImages;
  const isCloudinaryConfigured =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME !== "placeholder_cloud_name";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {/* Upload zone */}
      {canAddMore && (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? "#b89d72" : "#ede5d8"}`,
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center",
            cursor: "pointer",
            background: isDragging
              ? "rgba(184,157,114,0.06)"
              : "rgba(250,247,242,0.8)",
            transition: "all 0.2s ease",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onFileChange}
            style={{ display: "none" }}
          />
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(184,157,114,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 0.75rem",
            }}
          >
            <ImagePlus size={20} style={{ color: "#b89d72" }} />
          </div>
          <div
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#2c2c2c",
              marginBottom: "0.25rem",
            }}
          >
            Drag & drop your photos here
          </div>
          <div
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.75rem",
              color: "#a09990",
            }}
          >
            or{" "}
            <span style={{ color: "#b89d72", textDecoration: "underline" }}>
              browse from your computer or phone
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.68rem",
              color: "#c5bdb7",
              marginTop: "0.5rem",
            }}
          >
            JPG, PNG, WEBP · Max {maxImages} images per product
          </div>
        </div>
      )}

      {/* Cloudinary not configured warning */}
      {!isCloudinaryConfigured && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "8px",
            padding: "0.6rem 0.9rem",
            fontSize: "0.72rem",
            color: "#92400e",
            fontFamily: "'Jost', sans-serif",
          }}
        >
          ⚠️ Cloudinary credentials not set yet. Add{" "}
          <code style={{ fontFamily: "monospace" }}>
            NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
          </code>
          ,{" "}
          <code style={{ fontFamily: "monospace" }}>CLOUDINARY_API_KEY</code>{" "}
          and{" "}
          <code style={{ fontFamily: "monospace" }}>CLOUDINARY_API_SECRET</code>{" "}
          to .env.local to enable uploads.
        </div>
      )}

      {/* Image previews grid */}
      {uploadedImages.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
            gap: "0.6rem",
          }}
        >
          {uploadedImages.map((img, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                aspectRatio: "1",
                borderRadius: "10px",
                overflow: "hidden",
                border: img.error ? "2px solid #fecdd3" : "1px solid #ede5d8",
                background: "#f5f0e8",
              }}
            >
              {/* Preview image — use local preview while uploading */}
              {(img.localPreview || img.url) && (
                <Image
                  src={(img.url || img.localPreview)!}
                  alt={`Product image ${i + 1}`}
                  fill
                  sizes="96px"
                  style={{ objectFit: "cover" }}
                  unoptimized={!!img.localPreview && !img.url}
                />
              )}

              {/* Uploading overlay */}
              {img.uploading && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.45)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                >
                  <Loader2
                    size={20}
                    style={{
                      color: "#ffffff",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <span
                    style={{
                      color: "#ffffff",
                      fontSize: "0.6rem",
                      fontFamily: "'Jost', sans-serif",
                    }}
                  >
                    Uploading…
                  </span>
                </div>
              )}

              {/* Error overlay */}
              {img.error && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(190,18,60,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px",
                  }}
                >
                  <span
                    style={{
                      color: "#ffffff",
                      fontSize: "0.58rem",
                      textAlign: "center",
                      fontFamily: "'Jost', sans-serif",
                    }}
                  >
                    Failed
                  </span>
                </div>
              )}

              {/* Remove button */}
              {!img.uploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(i);
                  }}
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.6)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                  }}
                  title="Remove image"
                >
                  <X size={11} />
                </button>
              )}

              {/* First image badge */}
              {i === 0 && img.url && !img.uploading && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "4px",
                    left: "4px",
                    background: "rgba(184,157,114,0.9)",
                    color: "#ffffff",
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    padding: "1px 5px",
                    borderRadius: "4px",
                    fontFamily: "'Jost', sans-serif",
                    textTransform: "uppercase",
                  }}
                >
                  Main
                </div>
              )}
            </div>
          ))}

          {/* Inline "Add more" button */}
          {canAddMore && uploadedImages.length > 0 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                aspectRatio: "1",
                borderRadius: "10px",
                border: "2px dashed #ede5d8",
                background: "rgba(250,247,242,0.8)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                color: "#a09990",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#b89d72")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#ede5d8")
              }
            >
              <Upload size={16} />
              <span style={{ fontSize: "0.6rem", fontFamily: "'Jost', sans-serif" }}>
                Add more
              </span>
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
