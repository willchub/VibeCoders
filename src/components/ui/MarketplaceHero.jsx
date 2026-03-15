import React from 'react';
import { Star, Sparkles, Scissors, Heart, Gem, CircleDot } from 'lucide-react';
import VideoBackground from './VideoBackground';
import GradualBlur from './GradualBlur';
import { GlassEffect, GlassFilter } from './liquid-glass';

const StatItem = ({ value, label }) => (
  <div className="flex flex-col items-center justify-center transition-transform hover:-translate-y-1 cursor-default">
    <span className="text-xl font-bold text-zinc-900 sm:text-2xl">{value}</span>
    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium sm:text-xs">{label}</span>
    <div className="mt-2 w-full max-w-[3rem] h-px bg-gray-200" />
  </div>
);

// Beauty/salon-style “brands” for marquee
const FALLBACK_PARTNERS = [
  { name: 'The Dapper Barber', icon: Scissors },
  { name: 'Nails by Chloe', icon: Gem },
  { name: 'Zenith Yoga', icon: Heart },
  { name: 'Active Recovery', icon: CircleDot },
  { name: 'Blush Studio', icon: Sparkles },
  { name: 'Glow Bar', icon: Star },
];

const MARQUEE_ICONS = [Scissors, Gem, Heart, CircleDot, Sparkles, Star];

const TYPE_TO_ICON = {
  Salon: Gem,
  Barbershop: Scissors,
  'Gym Class': Heart,
  Physio: CircleDot,
};

export default function MarketplaceHero({ children, stats, loading }) {
  const avgSavings = stats?.avgSavingsPercent ?? 50;
  const availableSlots = stats?.availableSlots ?? 0;
  const localSalons = stats?.localSalons ?? 0;
  const livePercent = stats?.livePercent ?? 0;
  const hasLiveData = stats && (stats.availableSlots > 0 || stats.localSalons > 0);

  const marqueeItems = (stats?.sellers?.length > 0)
    ? stats.sellers.map((item) => {
        const name = typeof item === 'string' ? item : item.name;
        const type = typeof item === 'string' ? null : item.type;
        const icon = (type && TYPE_TO_ICON[type]) || Sparkles;
        return { name, icon };
      })
    : FALLBACK_PARTNERS;

  return (
    <div className="relative w-full bg-white text-zinc-900 overflow-hidden font-sans">
      <GlassFilter />
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

            <GlassEffect className="animate-fade-in delay-400 rounded-2xl md:rounded-full p-2 max-w-2xl border border-gray-200/80 w-full">
              {children}
            </GlassEffect>
          </div>

          {/* Right column: stats card + marquee */}
          <div className="lg:col-span-5 space-y-6 lg:mt-12">
            <GlassEffect className="animate-fade-in delay-500 rounded-3xl p-8 border border-gray-200/80">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 ring-1 ring-gray-200">
                    <Sparkles className="h-6 w-6 text-brand-secondary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-zinc-900">
                      {loading ? '—' : hasLiveData ? `${avgSavings}%+` : '50%+'}
                    </div>
                    <div className="text-sm text-zinc-500">Off Last-Minute</div>
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Live slots</span>
                    <span className="text-zinc-900 font-medium">
                      {loading ? '—' : `${availableSlots} available`}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-500"
                      style={{ width: loading ? '0%' : `${Math.max(5, livePercent)}%` }}
                    />
                  </div>
                </div>
                <div className="h-px w-full bg-gray-200 mb-6" />
                <div className="grid grid-cols-3 gap-4 text-center items-end">
                  <StatItem
                    value={loading ? '—' : (hasLiveData ? `${avgSavings}%+` : '50%+')}
                    label="Savings"
                  />
                  <StatItem value={loading ? '—' : String(localSalons)} label="Salons" />
                  <StatItem value={loading ? '—' : String(availableSlots)} label="Slots" />
                </div>
              </div>
            </GlassEffect>

            <GlassEffect className="animate-fade-in delay-500 rounded-3xl py-8 border border-gray-200/80">
              <div className="w-full">
              <h3 className="mb-6 px-8 text-sm font-medium text-zinc-500">
                {marqueeItems === FALLBACK_PARTNERS ? 'Trusted by local salons & studios' : 'Companies with available bookings'}
              </h3>
              <div
                className="relative flex overflow-hidden"
                style={{
                  maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                }}
              >
                <div className="animate-marquee flex gap-12 whitespace-nowrap px-4">
                  {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={`${item.name}-${i}`}
                        className="flex items-center gap-2 opacity-60 transition-all hover:opacity-100 hover:scale-105 cursor-default text-zinc-600 hover:text-zinc-900"
                      >
                        <Icon className="h-6 w-6 fill-current shrink-0" />
                        <span className="text-lg font-bold tracking-tight">{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              </div>
            </GlassEffect>
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
