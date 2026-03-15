import React from 'react';

const VIDEO_SRC = '/media/hero-background.mp4';

/**
 * Full-bleed looping video background. Muted + playsInline for autoplay.
 * Slightly zoomed so bottom (e.g. watermarks) is cropped; fills viewport with no black.
 * Optional overlay via overlayClassName (e.g. tint for readability).
 */
export default function VideoBackground({ overlayClassName = 'bg-stone-900/50', maskStyle }) {
  return (
    <>
      <div className="absolute inset-0 z-0 overflow-hidden bg-white">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover origin-center scale-[1.2]"
          aria-hidden
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      </div>
      <div
        className={`absolute inset-0 z-[1] ${overlayClassName}`}
        style={{
          maskImage: maskStyle?.maskImage,
          WebkitMaskImage: maskStyle?.WebkitMaskImage ?? maskStyle?.maskImage,
        }}
        aria-hidden
      />
    </>
  );
}
