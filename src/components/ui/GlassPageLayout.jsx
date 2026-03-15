import React from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import VideoBackground from './VideoBackground';

/**
 * Full-page glassmorphism layout: video background, warm overlay, optional title/subtitle, glass content area.
 */
export default function GlassPageLayout({ title, subtitle, children, maxWidth = 'max-w-2xl', className = '' }) {
  return (
    <div className={`min-h-screen flex flex-col bg-white text-zinc-900 font-sans ${className}`}>
      <div className="absolute inset-0 z-0">
        <VideoBackground
          overlayClassName="bg-white/80"
          maskStyle={{
            maskImage: 'linear-gradient(180deg, black 0%, black 50%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(180deg, black 0%, black 50%, transparent 100%)',
          }}
        />
      </div>
      <Header variant="light" />
      <main className={`relative z-10 flex-grow mx-auto w-full px-4 py-12 sm:px-6 lg:px-8 ${maxWidth}`}>
        {(title || subtitle) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-2 text-zinc-600">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </main>
      <Footer variant="light" />
    </div>
  );
}

/**
 * Glass card panel – use for form/content blocks on glass pages.
 */
export function GlassCard({ children, className = '' }) {
  return (
    <div
      className={`rounded-3xl border border-gray-200 bg-white/95 backdrop-blur-xl shadow-xl p-6 sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
