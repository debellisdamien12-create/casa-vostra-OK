import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Grid, 
  Wrench, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Compass, 
  ChevronRight, 
  Menu, 
  X,
  PhoneCall,
  FileText,
  MapPin,
  Check
} from "lucide-react";

const CONTACT_EMAIL = "contact@casavostra.corsica";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [briefSubmitted, setBriefSubmitted] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [copied, setCopied] = useState(false);

  // Form state
  const [projectType, setProjectType] = useState("carrelage");
  const [projectNature, setProjectNature] = useState("renovation");
  const [surface, setSurface] = useState("");
  const [timeline, setTimeline] = useState("prochainement");
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const handleBriefSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!contactPhone && !contactEmail) {
      toast.error("Veuillez renseigner au moins un moyen de contact (téléphone ou e-mail).");
      return;
    }

    const natureLabel = projectNature === "neuf" ? "Chantier Neuf" : "Rénovation";
    const typeLabels: Record<string, string> = {
      carrelage: "Pose de Carrelage & Faïence",
      chape: "Chape, Ragréage & Préparation",
      petites_renovations: "Petites Rénovations ciblées",
      complet: "Travaux multiples / Finitions"
    };

    const summary = `[BRIEF PROJET - CASA VOSTRA]
• Type : ${typeLabels[projectType] || projectType}
• Nature : ${natureLabel}
• Surface estimée : ${surface || "Non précisée"} m²
• Calendrier : ${timeline}
• Localisation : ${location || "Non renseignée"}
• Précisions : ${details || "Aucune"}
• Contact : ${contactName || "Anonyme"} | Tél: ${contactPhone || "Non renseigné"} | Email: ${contactEmail || "Non renseigné"}`;

    setSummaryText(summary);
    setBriefSubmitted(true);

    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Demande de devis — ${typeLabels[projectType] || projectType} — ${natureLabel}`)}&body=${encodeURIComponent(summary)}`;
    window.location.href = mailto;
    toast.success("Votre brief est prêt à être envoyé", {
      description: `Votre messagerie va préparer un e-mail pour ${CONTACT_EMAIL}.`
    });
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#1D1D1F] selection:bg-[#8C6D53]/20 font-sans antialiased">
      {/* Top Announcement Bar */}
      <div className="bg-[#1D1D1F] text-[#FBFBFA] text-xs py-2 px-4 text-center tracking-wide font-medium">
        <span>Casa Vostra • Neuf & Rénovation • Carrelage, Faïence, Chape & Finitions d'exception</span>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-[#1D1D1F]/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Retour en haut">
            <img
              src="/manus-storage/Logosvg_d684bd94.svg"
              alt="Casa Vostra — votre projet, notre savoir-faire"
              className="h-11 w-auto max-w-[210px] object-contain object-left sm:h-14 sm:max-w-[250px]"
            />
          </button>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#424245]">
            <button onClick={() => scrollToSection("approche")} className="hover:text-[#1D1D1F] transition-colors">Notre approche</button>
            <button onClick={() => scrollToSection("expertises")} className="hover:text-[#1D1D1F] transition-colors">Expertises</button>
            <button onClick={() => scrollToSection("methode")} className="hover:text-[#1D1D1F] transition-colors">Déroulement</button>
            <button onClick={() => scrollToSection("brief")} className="hover:text-[#1D1D1F] transition-colors">Brief express</button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button 
              onClick={() => scrollToSection("brief")} 
              className="bg-[#1D1D1F] hover:bg-[#333336] text-white rounded-full px-6 text-sm font-medium transition-all shadow-sm"
            >
              Envoyer mon projet <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>

          <button 
            className="md:hidden p-2 text-[#1D1D1F]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#FBFBFA] border-b border-[#1D1D1F]/10 py-6 px-6 shadow-xl flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
            <button onClick={() => scrollToSection("approche")} className="text-left py-2 font-medium text-lg border-b border-[#1D1D1F]/5">Notre approche</button>
            <button onClick={() => scrollToSection("expertises")} className="text-left py-2 font-medium text-lg border-b border-[#1D1D1F]/5">Expertises</button>
            <button onClick={() => scrollToSection("methode")} className="text-left py-2 font-medium text-lg border-b border-[#1D1D1F]/5">Déroulement</button>
            <button onClick={() => scrollToSection("brief")} className="text-left py-2 font-medium text-lg text-[#8C6D53]">Brief express</button>
            <Button 
              onClick={() => scrollToSection("brief")} 
              className="bg-[#1D1D1F] text-white w-full py-3 rounded-full mt-2 font-medium"
            >
              Démarrer mon projet <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8C6D53]/10 text-[#8C6D53] text-xs font-mono uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Neuf & Rénovation • Carrelage & Faïence
              </div>
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl tracking-tight font-normal leading-[1.08]">
                L'art des belles matières, <span className="italic font-light text-[#8C6D53]">sans perte de temps.</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#515154] font-normal leading-relaxed max-w-2xl">
                Que ce soit en construction <strong>neuve</strong> ou en <strong>rénovation</strong>, Casa Vostra intervient avec une exigence absolue sur vos poses de <strong>carrelage, faïence, chapes et petites rénovations ciblées</strong>. Dégrossissez votre projet en 2 minutes pour un premier échange immédiatement concret.
              </p>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Button 
                  onClick={() => scrollToSection("brief")}
                  className="bg-[#1D1D1F] hover:bg-[#333336] text-white rounded-full px-8 py-6 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Qualifier mon projet (2 min) <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => scrollToSection("expertises")}
                  className="border-[#1D1D1F]/20 hover:bg-[#1D1D1F]/5 text-[#1D1D1F] rounded-full px-8 py-6 text-base font-medium"
                >
                  Découvrir nos savoir-faire
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#1D1D1F]/10 text-sm">
                <div>
                  <span className="font-serif text-2xl font-semibold block text-[#1D1D1F]">Neuf & Rénov'</span>
                  <span className="text-[#6E6E73] text-xs">Intervention sur-mesure</span>
                </div>
                <div>
                  <span className="font-serif text-2xl font-semibold block text-[#1D1D1F]">0% blabla</span>
                  <span className="text-[#6E6E73] text-xs">Brief structuré direct</span>
                </div>
                <div>
                  <span className="font-serif text-2xl font-semibold block text-[#1D1D1F]">Précision</span>
                  <span className="text-[#6E6E73] text-xs">Chape, pose & finitions</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/5] bg-[#EAE8E4]">
                <img 
                  src="/manus-storage/casa_vostra_hero_a1b2c3d4.jpg" 
                  alt="Carrelage grand format et finitions haut de gamme Casa Vostra" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#E3D5C9] mb-1">Standard d'exécution</span>
                  <p className="font-serif text-xl font-medium">L'exigence du détail, du support jusqu'aux joints parfaits.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="approche" className="py-24 bg-[#1D1D1F] text-[#FBFBFA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#8C6D53] block mb-3">01 / NOTRE APPROCHE</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight leading-tight">
              Pourquoi nous faisons gagner un temps précieux à nos clients.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4 p-8 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="w-12 h-12 rounded-lg bg-[#8C6D53]/20 flex items-center justify-center text-[#E3D5C9] font-serif text-xl">
                01
              </div>
              <h3 className="font-serif text-xl font-medium">Un cadre clair dès le départ</h3>
              <p className="text-[#A1A1A6] text-sm leading-relaxed">
                Pas d’appels interminables pour redéfinir ce que vous voulez. Notre questionnaire en ligne qualifie immédiatement vos surfaces, vos contraintes et vos attentes.
              </p>
            </div>

            <div className="space-y-4 p-8 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="w-12 h-12 rounded-lg bg-[#8C6D53]/20 flex items-center justify-center text-[#E3D5C9] font-serif text-xl">
                02
              </div>
              <h3 className="font-serif text-xl font-medium">Neuf & Rénovation ciblée</h3>
              <p className="text-[#A1A1A6] text-sm leading-relaxed">
                Qu'il s'agisse d'une construction neuve complète ou d'une rénovation de salle de bains, cuisine ou sol de pièce de vie, nous maîtrisons chaque étape technique.
              </p>
            </div>

            <div className="space-y-4 p-8 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="w-12 h-12 rounded-lg bg-[#8C6D53]/20 flex items-center justify-center text-[#E3D5C9] font-serif text-xl">
                03
              </div>
              <h3 className="font-serif text-xl font-medium">Maîtrise des supports & chapes</h3>
              <p className="text-[#A1A1A6] text-sm leading-relaxed">
                Un beau carrelage ou une faïence irréprochable commence par une chape et un ragréage parfaits. Nous ne transigeons jamais avec la préparation des fonds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Expertises Section */}
      <section id="expertises" className="py-24 bg-[#FBFBFA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div className="max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-widest text-[#8C6D53] block mb-3">02 / NOS DOMAINES D'INTERVENTION</span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight leading-tight">
                Du gros œuvre de finition aux détails de faïence.
              </h2>
            </div>
            <p className="text-[#6E6E73] text-sm max-w-md mt-4 md:mt-0">
              Interventions soignées pour particuliers et professionnels exigeants, en neuf comme en rénovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-[#1D1D1F]/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#8C6D53]/10 flex items-center justify-center text-[#8C6D53] mb-6">
                  <Grid className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-medium mb-3">Carrelage & Grands Formats</h3>
                <p className="text-[#6E6E73] text-sm leading-relaxed">
                  Pose de carrelage grès cérame, dalles grand format, rectifié, pierres naturelles et plinthes encastrées.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#1D1D1F]/5 text-xs font-mono uppercase tracking-wider text-[#8C6D53]">
                Neuf & Rénovation
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#1D1D1F]/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#8C6D53]/10 flex items-center justify-center text-[#8C6D53] mb-6">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-medium mb-3">Faïence & Mosaïque</h3>
                <p className="text-[#6E6E73] text-sm leading-relaxed">
                  Habillage mural de salles de bains, douches à l'italienne, crédences de cuisines et faïences décoratives.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#1D1D1F]/5 text-xs font-mono uppercase tracking-wider text-[#8C6D53]">
                Salles d'eau & Cuisine
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#1D1D1F]/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#8C6D53]/10 flex items-center justify-center text-[#8C6D53] mb-6">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-medium mb-3">Chape & Ragréage</h3>
                <p className="text-[#6E6E73] text-sm leading-relaxed">
                  Réalisation de chapes fluides ou traditionnelles, ragréages techniques et préparation minutieuse des supports.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#1D1D1F]/5 text-xs font-mono uppercase tracking-wider text-[#8C6D53]">
                Bases & Niveaux
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#1D1D1F]/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#8C6D53]/10 flex items-center justify-center text-[#8C6D53] mb-6">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-medium mb-3">Petites Rénovations</h3>
                <p className="text-[#6E6E73] text-sm leading-relaxed">
                  Reprises ciblées, rafraîchissements de sols, rénovation partielle de pièces et travaux de finition soignés.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#1D1D1F]/5 text-xs font-mono uppercase tracking-wider text-[#8C6D53]">
                Intervention ciblée
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="methode" className="py-24 bg-[#EAE8E4]/50 border-y border-[#1D1D1F]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#8C6D53] block mb-3">03 / NOTRE MÉTHODE</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight leading-tight">
              Un parcours simple, direct et sans perte de temps.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-[#1D1D1F]/10">
              <span className="text-4xl font-serif text-[#8C6D53]/40 font-bold block mb-4">01</span>
              <h3 className="font-serif text-xl font-medium mb-2">Le Brief en 2 minutes</h3>
              <p className="text-[#6E6E73] text-sm leading-relaxed">
                Remplissez notre formulaire ci-dessous avec vos éléments clés (surface, type de pose, neuf ou rénov, calendrier).
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#1D1D1F]/10">
              <span className="text-4xl font-serif text-[#8C6D53]/40 font-bold block mb-4">02</span>
              <h3 className="font-serif text-xl font-medium mb-2">Analyse & Validation</h3>
              <p className="text-[#6E6E73] text-sm leading-relaxed">
                Nous étudions votre projet dès réception et vous contactons directement avec des propositions chiffrées pertinentes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#1D1D1F]/10">
              <span className="text-4xl font-serif text-[#8C6D53]/40 font-bold block mb-4">03</span>
              <h3 className="font-serif text-xl font-medium mb-2">Réalisation d'Excellence</h3>
              <p className="text-[#6E6E73] text-sm leading-relaxed">
                Intervention planifiée, respect des délais, chantier propre et finitions irréprochables par nos compagnons.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brief / Contact Form Section */}
      <section id="brief" className="py-24 bg-[#FBFBFA]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#8C6D53] block mb-3">04 / QUALIFIEZ VOTRE PROJET</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight leading-tight mb-4">
              Dégrossissons votre projet en 2 minutes.
            </h2>
            <p className="text-[#6E6E73] text-base">
              Renseignez les détails ci-dessous. Le système générera un brief clair que vous pourrez nous transmettre instantanément pour un premier échange efficace.
            </p>
          </div>

          {!briefSubmitted ? (
            <form onSubmit={handleBriefSubmit} className="bg-white p-8 sm:p-12 rounded-3xl border border-[#1D1D1F]/10 shadow-xl space-y-8">
              
              {/* Nature du chantier */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-[#1D1D1F]">
                  1. Nature du chantier <span className="text-[#8C6D53]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setProjectNature("renovation")}
                    className={`py-3.5 px-6 rounded-xl border text-sm font-medium transition-all text-left flex items-center justify-between ${
                      projectNature === "renovation" 
                        ? "border-[#1D1D1F] bg-[#1D1D1F] text-white shadow-sm" 
                        : "border-[#1D1D1F]/15 bg-white text-[#1D1D1F] hover:bg-[#F5F5F7]"
                    }`}
                  >
                    <span>Rénovation</span>
                    {projectNature === "renovation" && <Check className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setProjectNature("neuf")}
                    className={`py-3.5 px-6 rounded-xl border text-sm font-medium transition-all text-left flex items-center justify-between ${
                      projectNature === "neuf" 
                        ? "border-[#1D1D1F] bg-[#1D1D1F] text-white shadow-sm" 
                        : "border-[#1D1D1F]/15 bg-white text-[#1D1D1F] hover:bg-[#F5F5F7]"
                    }`}
                  >
                    <span>Chantier Neuf</span>
                    {projectNature === "neuf" && <Check className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Prestation principale */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-[#1D1D1F]">
                  2. Prestation principale recherchée <span className="text-[#8C6D53]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: "carrelage", title: "Pose de Carrelage & Faïence", desc: "Sols, murs, douches à l'italienne, grands formats" },
                    { id: "chape", title: "Chape, Ragréage & Supports", desc: "Chapes fluides/traditionnelles, mise à niveau" },
                    { id: "petites_renovations", title: "Petites Rénovations ciblées", desc: "Reprise partielle, rafraîchissement, finitions" },
                    { id: "complet", title: "Travaux multiples / Finitions", desc: "Projet combinant carrelage, faïence et chapes" }
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setProjectType(item.id)}
                      className={`p-5 rounded-xl border cursor-pointer transition-all ${
                        projectType === item.id
                          ? "border-[#1D1D1F] bg-[#1D1D1F]/5 ring-1 ring-[#1D1D1F]"
                          : "border-[#1D1D1F]/15 hover:border-[#1D1D1F]/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-serif font-medium text-base">{item.title}</span>
                        {projectType === item.id && <CheckCircle2 className="w-5 h-5 text-[#8C6D53]" />}
                      </div>
                      <p className="text-xs text-[#6E6E73]">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Surface & Calendrier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#1D1D1F]">
                    Surface estimée (en m²)
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ex: 45 m², ou SDB 8 m²..." 
                    value={surface}
                    onChange={(e) => setSurface(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#1D1D1F]/20 focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] text-sm bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#1D1D1F]">
                    Calendrier souhaité
                  </label>
                  <select 
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#1D1D1F]/20 focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] text-sm bg-white"
                  >
                    <option value="Immédiat / Urgent">Immédiat / Urgent</option>
                    <option value="Dans le mois (Prochainement)">Dans le mois (Prochainement)</option>
                    <option value="D'ici 3 à 6 mois">D'ici 3 à 6 mois</option>
                    <option value="Projet futur / Planification">Projet futur / Planification</option>
                  </select>
                </div>
              </div>

              {/* Localisation et détails */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#1D1D1F]">
                    Localisation du chantier (Ville / Code Postal)
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ex: 75008 ou Lyon..." 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#1D1D1F]/20 focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] text-sm bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#1D1D1F]">
                    Précisions utiles (matériaux, dépose...)
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ex: Dépose ancien carrelage, carrelage 60x60 fourni..." 
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#1D1D1F]/20 focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] text-sm bg-white"
                  />
                </div>
              </div>

              {/* Coordonnées */}
              <div className="pt-6 border-t border-[#1D1D1F]/10 space-y-4">
                <h3 className="font-serif text-lg font-medium">Vos coordonnées pour vous joindre</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#6E6E73] mb-1">Votre nom</label>
                    <input 
                      type="text" 
                      placeholder="Jean Dupont" 
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#1D1D1F]/20 focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6E6E73] mb-1">Téléphone <span className="text-[#8C6D53]">*</span></label>
                    <input 
                      type="tel" 
                      placeholder="06 12 34 56 78" 
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#1D1D1F]/20 focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6E6E73] mb-1">E-mail</label>
                    <input 
                      type="email" 
                      placeholder="jean@exemple.fr" 
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#1D1D1F]/20 focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] text-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit"
                  className="w-full bg-[#1D1D1F] hover:bg-[#333336] text-white py-6 rounded-2xl font-medium text-base shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Générer mon brief & valider <ArrowRight className="w-5 h-5" />
                </Button>
                <p className="text-center text-xs text-[#6E6E73] mt-3">
                  Votre demande sera préparée pour {CONTACT_EMAIL} avec les informations essentielles du chantier.
                </p>
              </div>

            </form>
          ) : (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#1D1D1F]/10 shadow-xl space-y-6 text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-[#8C6D53]/10 text-[#8C6D53] rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-3xl font-normal">Votre brief est prêt.</h3>
              <p className="text-[#6E6E73] text-sm max-w-lg mx-auto">
                Votre demande est structurée. Votre messagerie peut maintenant préparer l’e-mail destiné à <strong>{CONTACT_EMAIL}</strong> avec toutes les informations de votre chantier.
              </p>

              <div className="bg-[#FBFBFA] p-6 rounded-2xl border border-[#1D1D1F]/10 text-left font-mono text-xs whitespace-pre-wrap text-[#1D1D1F] max-w-xl mx-auto overflow-x-auto">
                {summaryText}
              </div>

              <p className="text-center text-xs text-[#6E6E73] max-w-xl mx-auto">Si aucune messagerie ne s’ouvre, copiez le brief affiché ci-dessus et envoyez-le manuellement à {CONTACT_EMAIL}.</p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button 
                  onClick={() => {
                    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Demande de devis — Casa Vostra")}&body=${encodeURIComponent(summaryText)}`;
                    window.location.href = mailto;
                  }}
                  className="bg-[#1D1D1F] text-white rounded-full px-8 py-3 text-sm font-medium w-full sm:w-auto"
                >
                  Envoyer par e-mail
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setBriefSubmitted(false)}
                  className="border-[#1D1D1F]/20 text-[#1D1D1F] rounded-full px-8 py-3 text-sm font-medium w-full sm:w-auto"
                >
                  Modifier mon brief
                </Button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1D1D1F] text-[#FBFBFA] py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-white/10">
            <div className="md:col-span-6 space-y-4">
              <img
                src="/manus-storage/logo-casavostra_22a69d34.png"
                alt="Casa Vostra — votre projet, notre savoir-faire"
                className="h-16 w-auto max-w-[260px] object-contain object-left"
              />
              <p className="text-[#A1A1A6] text-sm max-w-md leading-relaxed">
                Entreprise spécialisée en neuf et rénovation : carrelage, faïence, chape, ragréage et petites rénovations d'exception. Zéro compromis sur la préparation et la finition.
              </p>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#8C6D53]">Navigation</h4>
              <ul className="space-y-2 text-sm text-[#A1A1A6]">
                <li><button onClick={() => scrollToSection("approche")} className="hover:text-white transition-colors">Notre approche</button></li>
                <li><button onClick={() => scrollToSection("expertises")} className="hover:text-white transition-colors">Expertises</button></li>
                <li><button onClick={() => scrollToSection("methode")} className="hover:text-white transition-colors">Déroulement</button></li>
                <li><button onClick={() => scrollToSection("brief")} className="hover:text-white transition-colors">Brief express</button></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#8C6D53]">Contact Direct</h4>
              <p className="text-sm text-[#A1A1A6]">Disponible pour vos chantiers neufs et rénovations.</p>
              <p className="text-sm font-medium text-white">contact@casavostra-btp.fr</p>
              <p className="text-xs text-[#8C6D53] font-mono">Devis qualifié sous 48h</p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A1A1A6]">
            <p>© {new Date().getFullYear()} Casa Vostra SARL. Tous droits réservés.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
