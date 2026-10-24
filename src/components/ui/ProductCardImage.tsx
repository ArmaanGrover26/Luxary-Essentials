"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { Package } from "lucide-react";

interface ProductCardImageProps {
  images: string[] | undefined | null;
  alt: string;
  sizes?: string;
  intervalMs?: number;
  className?: string;
}

export default function ProductCardImage({
  images,
  alt,
  sizes = "(max-width: 560px) 50vw, (max-width: 768px) 50vw, 320px",
  intervalMs = 2800,
  className = "",
}: ProductCardImageProps) {
  // Normalize images list
  const validImages = useMemo(() => {
    if (!images || !Array.isArray(images)) return [];
    return images.filter((img): img is string => typeof img === "string" && img.trim().length > 0);
  }, [images]);

  const count = validImages.length;
  const isMulti = count > 1;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [failedIndices, setFailedIndices] = useState<Record<number, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset index if image list changes (e.g. filter or pagination)
  useEffect(() => {
    setCurrentIndex(0);
    setFailedIndices({});
  }, [validImages]);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // IntersectionObserver: Only cycle when card is visible in the viewport
  useEffect(() => {
    if (!isMulti || reducedMotion) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        rootMargin: "60px",
        threshold: 0.15,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isMulti, reducedMotion]);

  // Advance slideshow on interval
  const nextSlide = useCallback(() => {
    if (count <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % count);
  }, [count]);

  useEffect(() => {
    // Only run timer if multi-image, card in view, not hovered, motion allowed, document visible
    if (!isMulti || !isInView || isHovered || reducedMotion) return;

    let timerId: NodeJS.Timeout | null = null;

    const startTimer = () => {
      if (document.visibilityState === "hidden") return;
      timerId = setInterval(() => {
        nextSlide();
      }, intervalMs);
    };

    startTimer();

    const handleVisibility = () => {
      if (document.visibilityState === "hidden" && timerId) {
        clearInterval(timerId);
        timerId = null;
      } else if (document.visibilityState === "visible") {
        startTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (timerId) clearInterval(timerId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isMulti, isInView, isHovered, reducedMotion, intervalMs, nextSlide]);

  // If no images at all
  if (count === 0) {
    return (
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--light-gray)",
          background: "var(--ivory)",
        }}
        className={className}
      >
        <Package size={36} />
      </div>
    );
  }

  // Single static image (no intervals, no observer, no dots)
  if (!isMulti) {
    const src = validImages[0];
    const isFailed = failedIndices[0];

    if (isFailed) {
      return (
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--light-gray)",
            background: "var(--ivory)",
          }}
          className={className}
        >
          <Package size={36} />
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        style={{ position: "relative", width: "100%", height: "100%" }}
        className={className}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          style={{ objectFit: "cover" }}
          onError={() => setFailedIndices({ 0: true })}
        />
      </div>
    );
  }

  // Multi-image dynamic slideshow
  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
      className={className}
    >
      {/* Stack of images with crossfade */}
      {validImages.map((src, idx) => {
        const isCurrent = idx === currentIndex;
        // Optimization: only mount images that are current, adjacent, or index 0 to avoid eager downloading
        const shouldRender =
          idx === 0 ||
          idx === currentIndex ||
          idx === (currentIndex + 1) % count ||
          isInView;

        if (!shouldRender || failedIndices[idx]) return null;

        return (
          <div
            key={src + idx}
            style={{
              position: "absolute",
              inset: 0,
              opacity: isCurrent ? 1 : 0,
              transition: reducedMotion ? "none" : "opacity 0.65s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: isCurrent ? 1 : 0,
              pointerEvents: "none",
            }}
          >
            <Image
              src={src}
              alt={`${alt} - view ${idx + 1}`}
              fill
              sizes={sizes}
              loading={idx === 0 ? "eager" : "lazy"}
              style={{ objectFit: "cover" }}
              onError={() =>
                setFailedIndices((prev) => ({ ...prev, [idx]: true }))
              }
            />
          </div>
        );
      })}

      {/* Discreet, elegant dot indicators */}
      <div
        style={{
          position: "absolute",
          bottom: "8px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "3px 6px",
          borderRadius: "12px",
          background: "rgba(0,0,0,0.32)",
          backdropFilter: "blur(4px)",
          zIndex: 3,
          pointerEvents: "auto",
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {validImages.map((_, i) => {
          const isActive = i === currentIndex;
          return (
            <button
              key={i}
              type="button"
              aria-label={`Slide to photo ${i + 1}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(i);
              }}
              style={{
                width: isActive ? "14px" : "5px",
                height: "5px",
                borderRadius: "3px",
                border: "none",
                background: isActive ? "var(--gold)" : "rgba(255,255,255,0.6)",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.25s ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
