import { useEffect, useState } from "react";
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Clipboard, Instagram, MoveUpRight, Ruler, Sparkles, X } from "lucide-react";
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

type GalleryFilter = "Toutes" | "Sols" | "Salles d’eau" | "Détails";
type GalleryItem = {
  id: string;
  title: string;
  category: Exclude<GalleryFilter, "Toutes">;
  label: string;
  image: string;
  alt: string;
  featured?: boolean;
};

const galleryItems: GalleryItem[] = [
  { id: "real-01", title: "Faïence et lignes fines", category: "Salles d’eau", label: "Salle d’eau · Réalisation Casa Vostra", image: "/manus-storage/7B14C597-3D1D-4F75-9D2E-B2CF772BACD4_4dd2cb62.jpg", alt: "Faïence murale fine et escalier intérieur habillé", featured: true },
  { id: "real-02", title: "Terrasse minérale", category: "Sols", label: "Terrasse · Réalisation Casa Vostra", image: "/manus-storage/IMG_8803_56053e57.jpeg", alt: "Terrasse extérieure réalisée en dalles minérales" },
  { id: "real-03", title: "Pose en cours", category: "Détails", label: "Étape de pose · Réalisation Casa Vostra", image: "/manus-storage/IMG_2588_b353d62f.PNG", alt: "Pose de grands carreaux au sol avec système de nivellement" },
  { id: "real-04", title: "Effet pierre", category: "Détails", label: "Matière · Réalisation Casa Vostra", image: "/manus-storage/0CAC8079-AAF1-47AB-B32D-6DEA8CAFAE35_3ee53dd1.jpg", alt: "Détail d'une surface minérale effet pierre" },
  { id: "real-05", title: "Douche grand format", category: "Salles d’eau", label: "Salle d’eau · Réalisation Casa Vostra", image: "/manus-storage/IMG_2204_428a3b72.jpeg", alt: "Salle d'eau avec revêtement mural effet marbre et niche" },
  { id: "real-06", title: "Calepinage en chantier", category: "Détails", label: "Étape de pose · Réalisation Casa Vostra", image: "/manus-storage/IMG_2188_ead13daf.jpeg", alt: "Chantier en cours avec grands formats au sol" },
  { id: "real-07", title: "Parois minérales", category: "Salles d’eau", label: "Douche · Réalisation Casa Vostra", image: "/manus-storage/IMG_1703_9572addd.jpeg", alt: "Douche en cours de réalisation avec grandes dalles murales" },
  { id: "real-08", title: "Préparation des supports", category: "Détails", label: "Préparation · Réalisation Casa Vostra", image: "/manus-storage/IMG_1588_579f6eab.jpeg", alt: "Salle d'eau en préparation avec repères de pose" },
  { id: "real-09", title: "Grand format au sol", category: "Sols", label: "Sol · Réalisation Casa Vostra", image: "/manus-storage/IMG_1542_ff1024d3.jpeg", alt: "Pose de grands carreaux au sol avec système de nivellement" },
  { id: "real-10", title: "Matière bois et pierre", category: "Détails", label: "Revêtement · Réalisation Casa Vostra", image: "/manus-storage/IMG_1189_0f0d95ab.jpeg", alt: "Revêtement mural intérieur effet bois et pierre" },
  { id: "real-11", title: "Finition bois", category: "Sols", label: "Sol · Réalisation Casa Vostra", image: "/manus-storage/IMG_1176_72bb79e5.jpeg", alt: "Sol intérieur avec finition bois" },
  { id: "real-12", title: "Marches habillées", category: "Détails", label: "Escalier · Réalisation Casa Vostra", image: "/manus-storage/IMG_1154_0f40d56b.jpeg", alt: "Escalier intérieur avec marches habillées" },
  { id: "real-13", title: "Vasque et plan minéral", category: "Salles d’eau", label: "Salle de bains · Réalisation Casa Vostra", image: "/manus-storage/IMG_1131_3753e78e.jpeg", alt: "Salle de bains avec vasque posée sur un plan minéral" },
  { id: "real-14", title: "Salle de bains contemporaine", category: "Salles d’eau", label: "Salle de bains · Réalisation Casa Vostra", image: "/manus-storage/IMG_1117_c82aa625.jpeg", alt: "Salle de bains contemporaine avec revêtement mural" },
  { id: "real-15", title: "Faïence en détail", category: "Détails", label: "Faïence · Réalisation Casa Vostra", image: "/manus-storage/IMG_1115_2a0da346.jpeg", alt: "Détail de faïence verticale associé à un grand format" },
  { id: "real-16", title: "Sol finition bois", category: "Sols", label: "Sol · Réalisation Casa Vostra", image: "/manus-storage/IMG_0421_aefec0a9.jpeg", alt: "Sol intérieur avec finition bois" },
];

const galleryFilters: GalleryFilter[] = ["Toutes", "Sols", "Salles d’eau", "Détails"];

export default function InstagramXXL() {
  const [copied, setCopied] = useState(false);
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>("Toutes");
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);

  const visibleGalleryItems = activeFilter === "Toutes"
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeFilter);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedGalleryItem(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const moveGallerySelection = (offset: number) => {
    if (!selectedGalleryItem || visibleGalleryItems.length < 2) return;
    const currentIndex = visibleGalleryItems.findIndex((item) => item.id === selectedGalleryItem.id);
    const nextIndex = (currentIndex + offset + visibleGalleryItems.length) % visibleGalleryItems.length;
    setSelectedGalleryItem(visibleGalleryItems[nextIndex]);
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
              src="/manus-storage/casa-vostra-logo-hd_022938b1.png"
              alt="Casa Vostra — votre projet, notre savoir-faire"
              className="h-10 w-auto max-w-[190px] object-contain object-left sm:h-12 sm:max-w-[230px]"
            />
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-[#6e6e73] md:flex">
            <a className="transition-colors hover:text-[#1d1d1f]" href="#savoir-faire">Savoir-faire</a>
            <a className="transition-colors hover:text-[#1d1d1f]" href="#galerie">Galerie</a>
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
                src="/manus-storage/casa-vostra-bathroom-faience_55499b2e.jpg"
                alt="Salle d’eau contemporaine avec faïence grand format et niche habillée, Casa Vostra"
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

      <section id="galerie" className="border-y border-[#1d1d1f]/10 bg-[#f7f7f5] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#a27758] uppercase">02 / La galerie</p>
              <h2 className="mt-4 font-serif text-4xl leading-[1.02] tracking-[-0.05em] sm:text-6xl">Des matières qui prennent toute leur place.</h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#6e6e73]">Une sélection de réalisations Casa Vostra : grands formats, salles d’eau, sols et détails de pose. Ouvrez chaque image pour la voir en grand.</p>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer la galerie">
              {galleryFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 active:scale-[0.97] ${activeFilter === filter ? "border-[#1d1d1f] bg-[#1d1d1f] text-white" : "border-[#1d1d1f]/15 bg-transparent text-[#6e6e73] hover:border-[#1d1d1f]/40 hover:text-[#1d1d1f]"}`}
                  aria-pressed={activeFilter === filter}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-12 grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visibleGalleryItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedGalleryItem(item)}
                className={`group relative min-h-[220px] overflow-hidden rounded-[22px] bg-[#ded9d3] text-left shadow-[0_14px_35px_rgba(29,29,31,0.08)] transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a27758] ${item.featured ? "sm:col-span-2 sm:row-span-2" : ""}`}
                aria-label={`Ouvrir la réalisation ${item.title}`}
              >
                <img src={item.image} alt={item.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                <span className="absolute inset-0 bg-gradient-to-t from-[#1d1d1f]/75 via-[#1d1d1f]/10 to-transparent" />
                <span className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-6">
                  <span className="block text-[10px] font-semibold tracking-[0.16em] text-[#e8d7c7] uppercase">{item.label}</span>
                  <span className="mt-2 block font-serif text-2xl tracking-[-0.03em]">{item.title}</span>
                  <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold opacity-0 transition-opacity duration-200 group-hover:opacity-100">Voir le détail <MoveUpRight className="h-3.5 w-3.5" /></span>
                </span>
              </button>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-5 border-t border-[#1d1d1f]/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm leading-6 text-[#8a8a8f]">Une sélection de réalisations réelles Casa Vostra. Nous pouvons ajouter la ville, la surface et les détails techniques de chaque chantier lorsque vous nous les transmettez.</p>
            <a href="/#brief" className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#1d1d1f] underline decoration-[#a27758] decoration-2 underline-offset-8 transition-colors hover:text-[#a27758]">Parler de mon projet <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></a>
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
                src="/manus-storage/casa-vostra-pose-detail_e9bca9f2.jpg"
                alt="Pose de carrelage grand format sur chape préparée avec système de nivellement, Casa Vostra"
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

      {selectedGalleryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d1d1f]/85 p-4 backdrop-blur-md sm:p-8" role="dialog" aria-modal="true" aria-label={selectedGalleryItem.title}>
          <button type="button" className="absolute inset-0 cursor-default" onClick={() => setSelectedGalleryItem(null)} aria-label="Fermer la galerie" />
          <div className="relative z-10 grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[24px] bg-[#f7f7f5] shadow-2xl lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative min-h-[320px] bg-[#ded9d3] lg:min-h-[620px]">
              <img src={selectedGalleryItem.image} alt={selectedGalleryItem.alt} className="h-full w-full object-cover" />
              <button type="button" onClick={() => moveGallerySelection(-1)} className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1d1d1f] shadow-lg transition-transform hover:scale-105 disabled:opacity-40" aria-label="Image précédente" disabled={visibleGalleryItems.length < 2}><ChevronLeft className="h-5 w-5" /></button>
              <button type="button" onClick={() => moveGallerySelection(1)} className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1d1d1f] shadow-lg transition-transform hover:scale-105 disabled:opacity-40" aria-label="Image suivante" disabled={visibleGalleryItems.length < 2}><ChevronRight className="h-5 w-5" /></button>
            </div>
            <div className="flex flex-col justify-between p-7 sm:p-10">
              <div>
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.2em] text-[#a27758] uppercase">{selectedGalleryItem.category}</p>
                    <h3 className="mt-3 font-serif text-4xl leading-none tracking-[-0.05em]">{selectedGalleryItem.title}</h3>
                  </div>
                  <button type="button" onClick={() => setSelectedGalleryItem(null)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#1d1d1f]/10 text-[#6e6e73] transition-colors hover:bg-[#1d1d1f] hover:text-white" aria-label="Fermer"><X className="h-4 w-4" /></button>
                </div>
                <p className="mt-6 text-sm leading-7 text-[#6e6e73]">Cette réalisation est présentée dans son contexte. Nous pouvons compléter la fiche avec la ville, la surface et le détail technique du chantier lorsque vous nous les transmettez.</p>
              </div>
              <a href="/#brief" onClick={() => setSelectedGalleryItem(null)} className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.97]">Qualifier un projet similaire <ArrowUpRight className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-[#1d1d1f] px-5 pb-8 text-white/50 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Casa Vostra SARL · 1 Résidence Padulella, 20137 Lecci · SIREN 918 824 921</p>
          <div className="flex items-center gap-5">
            <a href="mailto:contact@casavostra.corsica" className="transition-colors hover:text-white">contact@casavostra.corsica</a>
            <Link href="/" className="transition-colors hover:text-white">Retour à l'accueil</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
