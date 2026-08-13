import { useState } from "react";
import { ArrowUpRight, Check, Clipboard, Instagram, MoveUpRight, Ruler, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

/**
 * Direction artistique — Atelier de précision :
 * minimalisme éditorial clair, palette ivoire/graphite/argile,
 * typographie contrastée, compositions asymétriques et CTA unique.
 */

const caption = `Le carrelage grand format transforme immédiatement une pièce : lignes plus continues, rendu plus contemporain et sensation d’espace renforcée.

Chez Casa Vostra, chaque étape compte, en neuf comme en rénovation : préparation des supports, calepinage, découpe, pose et finitions.

Vous avez un projet de carrelage XXL en Corse-du-Sud ? Qualifiez votre chantier en 2 minutes via le lien dans notre bio.`;

export default function InstagramXXL() {
  const [copied, setCopied] = useState(false);

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#1d1d1f] selection:bg-[#a27758]/20">
      <div className="border-b border-[#1d1d1f]/10 bg-[#1d1d1f] px-5 py-2 text-center text-[11px] font-medium tracking-[0.18em] text-white/80 uppercase">
        Casa Vostra · Carrelage XXL · Corse-du-Sud
      </div>

      <header className="sticky top-0 z-40 border-b border-[#1d1d1f]/10 bg-[#f7f7f5]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center" aria-label="Retour à l'accueil Casa Vostra">
            <img
              src="/manus-storage/Logosvg_d684bd94.svg"
              alt="Casa Vostra — votre projet, notre savoir-faire"
              className="h-10 w-auto max-w-[190px] object-contain object-left sm:h-12 sm:max-w-[230px]"
            />
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-[#6e6e73] md:flex">
            <a className="transition-colors hover:text-[#1d1d1f]" href="#savoir-faire">Savoir-faire</a>
            <a className="transition-colors hover:text-[#1d1d1f]" href="#publication">Le post</a>
            <a className="transition-colors hover:text-[#1d1d1f]" href="/#brief">Brief projet</a>
          </nav>

          <a href="/#brief" className="group inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-4 py-2.5 text-xs font-semibold text-white transition-transform duration-200 hover:bg-[#3a3a3d] active:scale-[0.97] sm:px-5 sm:text-sm">
            Démarrer un brief
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#1d1d1f]/10 bg-[#fbfbfa]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20 lg:py-28">
          <div className="max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#a27758]/25 bg-[#a27758]/8 px-3.5 py-2 text-[10px] font-semibold tracking-[0.18em] text-[#8a6549] uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Savoir-faire · Carrelage grand format
            </div>
            <h1 className="font-serif text-[clamp(3.1rem,8vw,7rem)] leading-[0.93] tracking-[-0.065em] text-[#1d1d1f]">
              Moins de joints.
              <span className="mt-2 block italic text-[#a27758]">Plus d’impact.</span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-[#5b5b60] sm:text-lg sm:leading-8">
              Le carrelage XXL agrandit visuellement les volumes et donne aux pièces une ligne plus continue. Mais un grand format ne pardonne rien : la qualité du support, du calepinage et des finitions fait toute la différence.
            </p>
            <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <a href="/#brief" className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#1d1d1f] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(29,29,31,0.14)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#3a3a3d] active:scale-[0.97]">
                Qualifier mon projet en 2 min
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <a href="#publication" className="inline-flex items-center gap-2 px-1 text-sm font-medium text-[#5b5b60] transition-colors hover:text-[#1d1d1f]">
                Voir le post
                <MoveUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[600px] lg:ml-auto">
            <div className="absolute -right-5 -top-6 h-28 w-28 rounded-full bg-[#e2d4c7] blur-3xl sm:-right-10 sm:-top-10 sm:h-44 sm:w-44" aria-hidden="true" />
            <div className="relative aspect-[0.86] overflow-hidden rounded-[28px] bg-[#e2ded8] shadow-[0_28px_70px_rgba(29,29,31,0.18)]">
              <img
                src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85"
                alt="Intérieur contemporain avec sol en carrelage grand format"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1f]/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7 text-white sm:p-9">
                <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-[#e8d7c7] uppercase">Casa Vostra · Standard d'exécution</p>
                <p className="max-w-sm font-serif text-2xl leading-tight tracking-[-0.03em] sm:text-3xl">La précision se voit dans les lignes que l’on ne remarque plus.</p>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-4 hidden items-center gap-3 rounded-2xl border border-[#1d1d1f]/10 bg-white/90 px-4 py-3 shadow-[0_14px_35px_rgba(29,29,31,0.12)] backdrop-blur-md sm:flex">
              <Ruler className="h-5 w-5 text-[#a27758]" />
              <span className="text-xs font-semibold text-[#1d1d1f]">Support · calepinage · finition</span>
            </div>
          </div>
        </div>
      </section>

      <section id="savoir-faire" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#a27758] uppercase">01 / L'expertise</p>
            <h2 className="mt-4 max-w-sm font-serif text-4xl leading-[1.03] tracking-[-0.05em] sm:text-5xl">Un grand format commence par une base irréprochable.</h2>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[#1d1d1f]/10 bg-[#1d1d1f]/10 sm:grid-cols-3">
            {[
              { number: "01", title: "Préparer", text: "Support, chape ou ragréage : la planéité conditionne la tenue et la continuité du rendu." },
              { number: "02", title: "Calepiner", text: "Anticiper les axes, les coupes et les points singuliers avant de poser le premier carreau." },
              { number: "03", title: "Fignoler", text: "Coupes nettes, joints réguliers et détails maîtrisés jusqu’à la dernière finition." },
            ].map((item) => (
              <article key={item.number} className="bg-[#fbfbfa] p-6 sm:p-7">
                <span className="font-mono text-xs text-[#a27758]">{item.number}</span>
                <h3 className="mt-10 font-serif text-2xl tracking-[-0.03em]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#6e6e73]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="publication" className="border-y border-[#1d1d1f]/10 bg-[#ece9e5] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#a27758] uppercase">02 / Le post à publier</p>
            <h2 className="mt-4 max-w-lg font-serif text-4xl leading-[1.02] tracking-[-0.05em] sm:text-6xl">Une réalisation se partage mieux quand elle se comprend.</h2>
            <p className="mt-6 max-w-md text-base leading-7 text-[#5b5b60]">Ce format fonctionne comme une publication Instagram, tout en donnant au visiteur une porte directe vers votre brief de projet.</p>
            <a href="/#brief" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#1d1d1f] underline decoration-[#a27758] decoration-2 underline-offset-8 transition-colors hover:text-[#a27758]">
              Je prépare mon projet
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <article className="overflow-hidden rounded-[24px] border border-[#1d1d1f]/12 bg-white shadow-[0_24px_60px_rgba(29,29,31,0.12)]">
            <div className="flex items-center justify-between border-b border-[#1d1d1f]/10 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1d1d1f] text-xs font-bold text-white">CV</span>
                <div>
                  <p className="text-sm font-semibold">@casavostra.corsica</p>
                  <p className="text-[11px] text-[#8a8a8f]">Corse-du-Sud · Carrelage XXL</p>
                </div>
              </div>
              <Instagram className="h-5 w-5 text-[#6e6e73]" />
            </div>
            <div className="aspect-[1.15] overflow-hidden bg-[#d9d2cb]">
              <img
                src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85"
                alt="Détail d'un intérieur contemporain avec carrelage grand format"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              />
            </div>
            <div className="p-6 sm:p-8">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-xs font-semibold tracking-[0.16em] text-[#a27758] uppercase">Post · exemple de légende</p>
                <Button variant="outline" size="sm" onClick={copyCaption} className="h-9 gap-2 rounded-full border-[#1d1d1f]/15 bg-transparent text-xs font-semibold">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
                  {copied ? "Copié" : "Copier"}
                </Button>
              </div>
              <p className="whitespace-pre-line text-[15px] leading-7 text-[#424245]">{caption}</p>
              <div className="mt-6 border-t border-[#1d1d1f]/10 pt-5 text-xs leading-6 text-[#8a8a8f]">
                #CarrelageXXL #GrandFormat #CarrelageCorse #CorseDuSud #RenovationCorse #ConstructionNeuve #Chape #Faience
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="bg-[#1d1d1f] px-5 py-20 text-white sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#d5b9a1] uppercase">03 / Le prochain geste</p>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-[1.02] tracking-[-0.05em] sm:text-6xl">Votre chantier mérite mieux qu’un échange approximatif.</h2>
          </div>
          <a href="/#brief" className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-6 py-4 text-sm font-semibold text-[#1d1d1f] transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.97]">
            Qualifier mon projet
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </section>

      <footer className="bg-[#1d1d1f] px-5 pb-8 text-white/50 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Casa Vostra SARL · Neuf & rénovation</p>
          <div className="flex items-center gap-5">
            <a href="mailto:contact@casavostra.corsica" className="transition-colors hover:text-white">contact@casavostra.corsica</a>
            <Link href="/" className="transition-colors hover:text-white">Retour à l'accueil</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
