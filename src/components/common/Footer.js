import React from 'react';
import { ArrowRight, Instagram, Twitter, Facebook } from 'lucide-react';

const Footer = ({ variant = 'light' }) => {
  const dark = variant === 'dark';
  const warm = variant === 'warm';
  return (
    <footer
      className={`border-t pt-16 pb-8 ${
        dark ? 'bg-white/5 border-white/10 backdrop-blur-md' : warm ? 'bg-amber-50/95 border-amber-200/50 backdrop-blur-sm' : 'bg-white border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <span
              className={`font-sans text-2xl font-semibold tracking-tight ${
                dark ? 'text-white' : 'text-brand-secondary'
              }`}
            >
              LA<span className="text-brand-primary">st</span> Minute
            </span>
            <p
              className={`font-sans mt-4 text-sm leading-relaxed ${
                dark ? 'text-zinc-400' : warm ? 'text-stone-600' : 'text-brand-muted'
              }`}
            >
              The #1 marketplace for spontaneous beauty bookings. Premium services at discounted rates, just for waiting.
            </p>
          </div>

          <div>
            <h4 className={`font-bold mb-4 uppercase text-xs tracking-widest ${dark ? 'text-zinc-300' : 'text-brand-secondary'}`}>Company</h4>
            <ul className={`space-y-2 text-sm ${dark ? 'text-zinc-400' : warm ? 'text-stone-600' : 'text-brand-muted'}`}>
              <li><a href="#about" className="hover:text-brand-primary transition-colors">About Us</a></li>
              <li><a href="#careers" className="hover:text-brand-primary transition-colors">Careers</a></li>
              <li><a href="#press" className="hover:text-brand-primary transition-colors">Press</a></li>
              <li><a href="#contact" className="hover:text-brand-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className={`font-bold mb-4 uppercase text-xs tracking-widest ${dark ? 'text-zinc-300' : 'text-brand-secondary'}`}>Support</h4>
            <ul className={`space-y-2 text-sm ${dark ? 'text-zinc-400' : warm ? 'text-stone-600' : 'text-brand-muted'}`}>
              <li><a href="#help" className="hover:text-brand-primary transition-colors">Help Center</a></li>
              <li><a href="#trust" className="hover:text-brand-primary transition-colors">Trust & Safety</a></li>
              <li><a href="#privacy" className="hover:text-brand-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#cookies" className="hover:text-brand-primary transition-colors">Cookie Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className={`font-bold mb-4 uppercase text-xs tracking-widest ${dark ? 'text-zinc-300' : 'text-brand-secondary'}`}>Newsletter</h4>
            <p className={`font-sans text-sm mb-4 ${dark ? 'text-zinc-400' : warm ? 'text-stone-600' : 'text-brand-muted'}`}>Get first access to exclusive daily deals.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="email@example.com"
                className={`rounded-lg text-sm flex-1 px-4 py-2 focus:ring-2 focus:ring-brand-primary outline-none ${
                  dark ? 'bg-white/10 border border-white/20 text-white placeholder:text-zinc-500' : warm ? 'bg-white/80 border border-amber-200/50 text-stone-800 placeholder:text-stone-500 focus:border-brand-primary' : 'bg-gray-50 border border-gray-200 text-zinc-900 placeholder:text-zinc-500 focus:border-brand-primary'
                }`}
              />
              <button type="button" className={`px-4 py-2 rounded-lg transition-colors ${warm ? 'bg-brand-secondary text-white hover:bg-brand-secondary/90' : 'bg-white text-zinc-950 hover:bg-zinc-100'}`}>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className={`border-t pt-8 flex flex-col md:flex-row justify-between items-center text-xs ${dark ? 'border-white/10 text-zinc-500' : warm ? 'border-amber-200/50 text-stone-600' : 'border-gray-50 text-brand-muted'}`}>
          <p>© {new Date().getFullYear()} LAst Minute Marketplace. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors flex items-center gap-1">
              <Instagram className="h-3 w-3" /> Instagram
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors flex items-center gap-1">
              <Twitter className="h-3 w-3" /> Twitter
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors flex items-center gap-1">
              <Facebook className="h-3 w-3" /> Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
