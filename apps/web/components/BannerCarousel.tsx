"use client";

import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";

type Banner = { id: string; title: string | null; image_url: string; link_url: string | null };

const INTERVAL = 4000;

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(Date.now());

  const goTo = useCallback((index: number) => {
    setCurrent(index);
    setProgress(0);
    startRef.current = Date.now();
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
    setProgress(0);
    startRef.current = Date.now();
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;

    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min((elapsed / INTERVAL) * 100, 100);
      setProgress(pct);
      if (elapsed >= INTERVAL) {
        next();
      }
    };

    timerRef.current = setInterval(tick, 50);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length, next]);

  if (banners.length === 0) return null;

  const banner = banners[current];

  const inner = (
    <div className="relative w-full overflow-hidden rounded-xl bg-gray-100 aspect-[3/1] sm:aspect-[21/9]">
      {banners.map((b, i) => (
        <div
          key={b.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={b.image_url}
            alt={b.title ?? "バナー"}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 1200px"
            priority={i === 0}
          />
          {b.title && (
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/40 to-transparent p-4">
              <span className="text-sm font-semibold text-white">{b.title}</span>
            </div>
          )}
        </div>
      ))}

      {/* Progress bars (Stories style) */}
      {banners.length > 1 && (
        <div className="absolute top-2 left-3 right-3 flex gap-1.5 z-10">
          {banners.map((b, i) => (
            <div
              key={b.id}
              className="h-0.5 flex-1 rounded-full bg-white/40 overflow-hidden"
            >
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{
                  width:
                    i < current
                      ? "100%"
                      : i === current
                      ? `${progress}%`
                      : "0%",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); goTo(i); }}
              className={`h-1.5 rounded-full transition-all ${i === current ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
            />
          ))}
        </div>
      )}

      {/* Click areas for prev/next */}
      {banners.length > 1 && (
        <>
          <button
            className="absolute left-0 top-0 h-full w-1/3 z-10"
            onClick={(e) => { e.preventDefault(); goTo((current - 1 + banners.length) % banners.length); }}
            aria-label="前のバナー"
          />
          <button
            className="absolute right-0 top-0 h-full w-1/3 z-10"
            onClick={(e) => { e.preventDefault(); next(); }}
            aria-label="次のバナー"
          />
        </>
      )}
    </div>
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      {banner.link_url ? (
        <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
          {inner}
        </a>
      ) : (
        <div>{inner}</div>
      )}
    </section>
  );
}
