import { useMemo, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Camera, Clock, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { HERO_IMAGE } from '../lib/catalog';
import { AnimatedLink } from '../components/AnimatedLink';
import { ProductCard } from '../components/ProductCard';
import { ResilientImage } from '../components/ResilientImage';

export function HomePage() {
  const { products, siteSettings } = useStore();
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 48]);

  // Pick 4 trending items from distinct sections for a compact 2-per-row showcase
  const trendingProducts = useMemo(() => {
    const allTrending = products.filter((p) => p.trending);
    const picked: typeof allTrending = [];
    const seenSections = new Set<string>();
    for (const p of allTrending) {
      if (!seenSections.has(p.sectionSlug) && picked.length < 4) {
        picked.push(p);
        seenSections.add(p.sectionSlug);
      }
    }
    return picked.length >= 4 ? picked : allTrending.slice(0, 4);
  }, [products]);

  return (
    <div className="space-y-10 sm:space-y-14 pb-16">
      {/* 1. Centered Hero Parallax Banner — shaded seamlessly into white with no hard bottom border */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-slate-950 text-white"
      >
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-x-0 -top-6 -bottom-14 pointer-events-none will-change-transform"
        >
          <ResilientImage
            src={HERO_IMAGE}
            alt="Shankar Mall Dhanbad interior aisles"
            loading="eager"
            fetchPriority="high"
            className="w-full h-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/40" />
        </motion.div>

        {/* Bottom atmospheric shade feathering smoothly into page white without any line */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 sm:h-36 bg-gradient-to-b from-transparent via-white/65 to-white"
        />

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 pt-14 sm:pt-20 lg:pt-24 pb-24 sm:pb-32">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center space-y-5">
            <p className="text-xs sm:text-sm font-medium text-amber-300 tracking-wide">
              {siteSettings.announcementBanner}
            </p>

            <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.08] tracking-tight [text-wrap:balance]">
              {siteSettings.heroHeadline}
            </h1>

            <p className="text-sm sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
              Skip billing queues across all Shankar Mall sections. Reserve chocolate, women &amp; men dresses, decorations, toys, skin care, snacks &amp; biscuits, or grains with zero login—and pay only at the Express Counter.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <AnimatedLink
                to="/sections"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#F59E0B] hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors whitespace-nowrap shrink-0"
              >
                <span>Browse Store Sections</span>
                <ArrowRight className="w-4 h-4" />
              </AnimatedLink>

              <AnimatedLink
                to="/quick-list"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-medium text-sm transition-colors whitespace-nowrap shrink-0"
              >
                <Camera className="w-4 h-4 text-amber-300" />
                <span>Snap &amp; Send Paper List</span>
              </AnimatedLink>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Snap & Send Shopping List Highlight Card */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-slate-900 text-white p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <p className="text-xs font-semibold text-amber-300">
              Family Monthly Ration Shortcut
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-bold [text-wrap:balance]">
              Have a handwritten grocery list? Snap a photo and collect at the counter.
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-xl">
              No need to search 30 items one by one. Take a quick photo of your paper list or paste your monthly ration bullets—our Hirapur or Rangatand packing team prepares everything before you arrive.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <AnimatedLink
                to="/quick-list"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0"
              >
                <Camera className="w-4 h-4" />
                <span>Upload Photo List Now</span>
              </AnimatedLink>
              <span className="text-xs text-blue-200">
                Zero advance payment · Ready within 2 hours
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/10 border border-white/15 rounded-xl p-4 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-xs text-blue-200 pb-1.5 border-b border-white/10">
              <span>How Express List Works</span>
              <span className="font-mono text-amber-300">3 Simple Steps</span>
            </div>
            <p className="text-slate-100">
              1. Snap your handwritten page or type item names &amp; weights.
            </p>
            <p className="text-slate-100">
              2. Pick Hirapur or Rangatand branch and your arrival slot.
            </p>
            <p className="text-slate-100">
              3. Receive WhatsApp alert when packed; pay by Cash, UPI, or Card.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Compact Trending Picks & Dhanbad Branch Cards */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-10">
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-amber-600 inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dhanbad Best-Sellers</span>
              </p>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                Trending Express Counter Picks
              </h2>
            </div>
            <AnimatedLink
              to="/sections"
              className="text-xs sm:text-sm font-semibold text-[#1E3A8A] hover:underline whitespace-nowrap shrink-0"
            >
              Browse All →
            </AnimatedLink>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </div>

        {/* Dhanbad Branches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1E3A8A]">Branch 01 · Flagship</span>
              <span className="text-xs text-slate-500">{siteSettings.openingHours}</span>
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              Hirapur — Hari Mandir Road
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dedicated Express Pickup Bay right beside the main entrance. Ideal for daily grains, chocolates, apparel, toys, and skincare pickups.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>Hari Mandir Rd, Hirapur, Dhanbad</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>2-Hour Ready Guarantee</span>
              </span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1E3A8A]">Branch 02 · Station Hub</span>
              <span className="text-xs text-slate-500">{siteSettings.openingHours}</span>
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              Rangatand — Near Railway Station
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Fast commute counter for travellers and Bank More families. Reserve your gift packs, snacks, or monthly ration online and collect in under 5 minutes.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>Rangatand Chowk, Dhanbad</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Cash / UPI / Card at Counter</span>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
