# UI Components & Project Setup

## Current project support

| Requirement    | Status | Notes |
|---------------|--------|--------|
| **Tailwind CSS** | ✅ Installed | v3, configured in `tailwind.config.js` |
| **TypeScript**   | ❌ Not used | App is JavaScript (CRA). Component provided as `.jsx`. |
| **shadcn structure** | ✅ Folder added | `src/components/ui` created for reusable UI primitives. |
| **lucide-react** | ✅ Installed | Used by the hero and other components. |

## Why `src/components/ui`?

- **shadcn-style layout**: shadcn/ui keeps reusable, copy-pasteable primitives (buttons, cards, dialogs) in a single `components/ui` folder. Putting the glassmorphism hero there keeps a clear place for shared UI building blocks.
- **Separation**: Other folders (`components/common`, `components/marketplace`, etc.) hold app-specific pieces; `components/ui` is for generic, reusable UI that any page can import.
- **Path**: Default path used here is `src/components/ui` (not `/components/ui`) so it fits CRA’s `src`-based structure.

## Integrated components

- **Glassmorphism hero (generic)**: `src/components/ui/glassmorphism-trust-hero.jsx` – design-showcase hero; use where you need “Crafting Digital Experiences” style copy.
- **Marketplace hero**: `src/components/ui/MarketplaceHero.jsx` – same glassmorphism look with marketplace copy (“Look Great, For Less”) and accepts the search form as `children`. Used on the marketplace page.
- **Dependencies**: React, `lucide-react`, Tailwind. No extra install needed.
- **Assets**: Background images use Unsplash URLs (no local assets).

## Optional: Add TypeScript

To use `.tsx` components in this CRA app:

```bash
npm install --save-dev typescript @types/react @types/react-dom @types/node
npx tsc --init
```

Then rename or add components as `.tsx` and add types as needed. You may need to adjust `tsconfig.json` for your paths (e.g. `"baseUrl": "src"`).

## Optional: shadcn CLI + Tailwind

This project already uses Tailwind v3. To adopt the **shadcn/ui** CLI and its component scripts:

1. shadcn/ui targets **Vite** or **Next.js** by default. For CRA you can still use the components by copying them manually into `src/components/ui` (as with this hero).
2. To use the CLI anyway, you’d typically init in a Vite/Next project, then copy the generated components into this repo’s `src/components/ui` and adjust imports (e.g. `@/components/ui` → `../../components/ui` or a path alias).

## Optional: Path alias for `@/components/ui`

To use `@/components/ui` in imports (like the original demo):

1. **CRA**: Install [craco](https://github.com/dilanx/craco) or [react-app-rewired](https://github.com/timarney/react-app-rewired) and add a path alias for `@` → `src`.
2. **Or** keep using relative imports: `import HeroSection from '../components/ui/glassmorphism-trust-hero';`

## Where to use the heroes

- **Marketplace**: The marketplace page uses `<MarketplaceHero>{searchForm}</MarketplaceHero>` – glassmorphism layout with “Look Great, For Less” and the service/location search form.
- **Landing**: Use `<HeroSection />` from `glassmorphism-trust-hero.jsx` on a dedicated landing or “For Salons” page if you want the generic “Crafting Digital Experiences” copy.
- **Marketing**: Use `MarketplaceHero` with custom `children` (e.g. a single CTA) on other pages if you want the same look with different content.

No context providers or global state are required; both components are self-contained and use only local state for animations (CSS).
