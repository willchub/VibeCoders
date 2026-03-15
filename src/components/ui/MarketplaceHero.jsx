import React from 'react';
import { Star, Sparkles, Scissors, Heart, Gem, CircleDot } from 'lucide-react';
import VideoBackground from './VideoBackground';
import GradualBlur from './GradualBlur';

const StatItem = ({ value, label }) => (
  <div className="flex flex-col items-center justify-center transition-transform hover:-translate-y-1 cursor-default">
    <span className="text-xl font-bold text-zinc-900 sm:text-2xl">{value}</span>
    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium sm:text-xs">{label}</span>
  </div>
);

// Beauty/salon-style “brands” for marquee
const PARTNERS = [
  { name: 'The Dapper Barber', icon: Scissors },
  { name: 'Nails by Chloe', icon: Gem },
  { name: 'Zenith Yoga', icon: Heart },
  { name: 'Active Recovery', icon: CircleDot },
  { name: 'Blush Studio', icon: Sparkles },
  { name: 'Glow Bar', icon: Star },
];

export default function MarketplaceHero({ children }) {
  return (
    <div className="relative w-full bg-white text-zinc-900 overflow-hidden font-sans">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-fade-in {
          animation: fadeSlideIn 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>

      <div className="absolute inset-0 z-0">
        <VideoBackground
          overlayClassName="bg-white/85"
          maskStyle={{
            maskImage: 'linear-gradient(180deg, transparent, black 0%, black 70%, transparent)',
            WebkitMaskImage: 'linear-gradient(180deg, transparent, black 0%, black 70%, transparent)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 md:pt-32 md:pb-20 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-start">
          {/* Left column: headline + search form */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8 pt-8">
            <div className="animate-fade-in delay-100">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100/90 px-3 py-1.5 backdrop-blur-md transition-colors hover:bg-gray-200/80">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-600 flex items-center gap-2">
                  Last-Minute Deals
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                </span>
              </div>
            </div>

            <h1
              className="animate-fade-in delay-200 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tighter leading-[0.9] text-zinc-900"
              style={{
                maskImage: 'linear-gradient(180deg, black 0%, black 80%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(180deg, black 0%, black 80%, transparent 100%)',
              }}
            >
              Look Great,<br />
              <span className="bg-gradient-to-br from-zinc-900 via-brand-secondary to-brand-primary bg-clip-text text-transparent">
                For Less.
              </span>
            </h1>

            <p className="animate-fade-in delay-300 max-w-xl text-lg text-zinc-600 leading-relaxed">
              Grab last-minute beauty deals near you and save up to 50%.
            </p>

            <div className="animate-fade-in delay-400">
              {children}
            </div>
          </div>

          {/* Right column: stats card + marquee */}
          <div className="lg:col-span-5 space-y-6 lg:mt-12">
            <div className="animate-fade-in delay-500 relative overflow-hidden rounded-3xl border border-gray-200 bg-white/95 p-8 backdrop-blur-xl shadow-xl">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-gray-100 blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 ring-1 ring-gray-200">
                    <Sparkles className="h-6 w-6 text-brand-secondary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-zinc-900">50%+</div>
                    <div className="text-sm text-zinc-500">Off Last-Minute</div>
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Booked Today</span>
                    <span className="text-zinc-900 font-medium">98%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary" />
                  </div>
                </div>
                <div className="h-px w-full bg-gray-200 mb-6" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <StatItem value="50%+" label="Savings" />
                  <div className="w-px h-full bg-gray-200 mx-auto" />
                  <StatItem value="Local" label="Salons" />
                  <div className="w-px h-full bg-gray-200 mx-auto" />
                  <StatItem value="Today" label="Slots" />
                </div>
                <div className="mt-8 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-600">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    LIVE
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-600">
                    <Star className="w-3 h-3 text-amber-500" />
                    TRUSTED
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fade-in delay-500 relative overflow-hidden rounded-3xl border border-gray-200 bg-white/95 py-8 backdrop-blur-xl shadow-xl">
              <h3 className="mb-6 px-8 text-sm font-medium text-zinc-500">Trusted by local salons & studios</h3>
              <div
                className="relative flex overflow-hidden"
                style={{
                  maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                }}
              >
                <div className="animate-marquee flex gap-12 whitespace-nowrap px-4">
                  {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((partner, i) => {
                    const Icon = partner.icon;
                    return (
                      <div
                        key={`${partner.name}-${i}`}
                        className="flex items-center gap-2 opacity-60 transition-all hover:opacity-100 hover:scale-105 cursor-default text-zinc-600 hover:text-zinc-900"
                      >
                        <Icon className="h-6 w-6 fill-current" />
                        <span className="text-lg font-bold tracking-tight">{partner.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GradualBlur
        target="parent"
        position="bottom"
        height="7rem"
        strength={2}
        divCount={5}
        curve="bezier"
        exponential
        opacity={1}
      />
    </div>
  );
}
