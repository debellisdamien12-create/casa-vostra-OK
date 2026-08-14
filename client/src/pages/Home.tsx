import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
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
  Check,
  Copy,
  Mail
} from "lucide-react";

const CONTACT_EMAIL = "contact@casavostra.corsica";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const FRENCH_PHONE_PATTERN = /^(?:(?:\+|00)33|0)[1-9](?:[\s.-]?\d{2}){4}$/;

type ClientMedia = { name: string; type: string; size: number; data: string };

const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(new Error(`Impossible de lire ${file.name}`));
  reader.readAsDataURL(file);
});

const getLeadErrorMessage = (message?: string) => {
  const normalizedMessage = (message || "").toLowerCase();
  if (normalizedMessage.includes("email")) return "Vérifiez l’adresse e-mail renseignée.";
  if (normalizedMessage.includes("téléphone") || normalizedMessage.includes("phone")) return "Vérifiez le format du numéro de téléphone.";
  if (normalizedMessage.includes("storage") || normalizedMessage.includes("upload") || normalizedMessage.includes("fichier")) return "Une pièce jointe n’a pas pu être transmise. Vérifiez son format et sa taille.";
  return "Votre demande n’a pas pu être transmise pour le moment. Vérifiez votre connexion puis réessayez.";
};

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [briefSubmitted, setBriefSubmitted] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [copied, setCopied] = useState(false);

  // Form state
  const [projectType, setProjectType] = useState("carrelage");
  const [projectNature, setProjectNature] = useState("renovation");
  const [surface, setSurface] = useState("");
  const [timeline, setTimeline] = useState("Immédiat / Urgent");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("5 000 € à 15 000 €");
  const [supplyScope, setSupplyScope] = useState("Fourniture par le client");
  const [details, setDetails] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [projectFiles, setProjectFiles] = useState<File[]>([]);
  const [leadId, setLeadId] = useState<number | null>(null);
  const [replySlots, setReplySlots] = useState(["", "", ""]);
  const [emailTemplate, setEmailTemplate] = useState("");
  const [emailTemplateCopied, setEmailTemplateCopied] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slotConfirmed, setSlotConfirmed] = useState(false);

  const normalizedPhone = contactPhone.trim();
  const normalizedEmail = contactEmail.trim();
  const isPhoneValid = FRENCH_PHONE_PATTERN.test(normalizedPhone);
  const isEmailValid = EMAIL_PATTERN.test(normalizedEmail);
  const showPhoneError = normalizedPhone.length > 0 && !isPhoneValid;
  const showEmailError = normalizedEmail.length > 0 && !isEmailValid;
  const contactFieldsValid = isPhoneValid && isEmailValid;

  const submitLead = trpc.leads.submit.useMutation({
    onSuccess: (data) => {
      toast.success("Demande transmise avec succès", {
        description: "Votre brief a été envoyé directement à Casa Vostra."
      });
      setLeadId(data.leadId || null);
      setSelectedSlot(null);
      setSlotConfirmed(false);
      setBriefSubmitted(true);
    },
    onError: (err) => {
      toast.error("Envoi impossible", {
        description: getLeadErrorMessage(err.message),
      });
    }
  });

  const assignSlot = trpc.leads.assignSlot.useMutation({
    onSuccess: () => {
      setSlotConfirmed(true);
      toast.success("Rendez-vous confirmé dans Outlook", {
        description: "Votre créneau a été enregistré dans le planning de Casa Vostra."
      });
    },
    onError: (err) => {
      toast.error("Réservation impossible", {
        description: getLeadErrorMessage(err.message),
      });
    },
  });


  const handleBriefSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!contactFieldsValid) {
      toast.error("Vérifiez le format de votre téléphone et de votre e-mail avant l'envoi.");
      return;
    }

    const natureLabel = projectNature === "neuf" ? "Chantier Neuf" : "Rénovation";
    const typeLabels: Record<string, string> = {
      carrelage: "Pose de Carrelage & Faïence",
      chape: "Chape, Ragréage & Préparation",
      petites_renovations: "Petites Rénovations ciblées",
      complet: "Travaux multiples / Finitions"
    };

    const mediaSummary = projectFiles.length > 0
      ? projectFiles.map((file) => file.name).join(", ")
      : "Aucun fichier sélectionné";

    const summary = `[BRIEF PROJET - CASA VOSTRA]
• Type de prestation : ${typeLabels[projectType] || projectType}
• Nature du chantier : ${natureLabel}
• Surface estimée : ${surface ? surface + " m²" : "Non précisée"}
• Budget estimé : ${budget}
• Fourniture : ${supplyScope}
• Calendrier souhaité : ${timeline}
• Localisation : ${location || "Non renseignée"}
• Précisions techniques : ${details || "Aucune"}
• Pièces jointes / Plans : ${mediaSummary}
• Coordonnées contact : ${contactName || "Anonyme"} | Tél : ${contactPhone} | E-mail : ${contactEmail}`;

    setSummaryText(summary);

    let media: ClientMedia[] = [];
    try {
      media = await Promise.all(projectFiles.map(async (file) => ({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        data: await fileToDataUrl(file),
      })));
    } catch {
      toast.error("Une pièce jointe n'a pas pu être préparée. Réessayez.");
      return;
    }

    submitLead.mutate({
      projectType: typeLabels[projectType] || projectType,
      projectNature: natureLabel,
      surface: surface || undefined,
      budget,
      supplyScope,
      timeline,
      location: location || undefined,
      details: details || undefined,
      mediaSummary,
      media,
      contactName: contactName || undefined,
      contactPhone: normalizedPhone,
      contactEmail: normalizedEmail,
    });
  };

  const generateEmailTemplate = () => {
    const availableSlots = replySlots.map((slot) => slot.trim()).filter(Boolean);
    if (availableSlots.length === 0) {
      toast.error("Ajoutez au moins un créneau Outlook disponible.");
      return;
    }

    const greetingName = contactName.trim() || "Madame, Monsieur";
    const slotsText = availableSlots.map((slot, index) => `${index + 1}. ${slot}`).join("\\n");
    const template = `Objet : Votre projet Casa Vostra — proposition de rendez-vous

Bonjour ${greetingName},

Merci pour votre demande et pour les éléments transmis concernant votre projet. Nous avons bien reçu votre brief et allons pouvoir échanger sur les supports, les surfaces et les finitions souhaitées.

Après première analyse, je vous propose les disponibilités suivantes pour un échange technique :
${slotsText}

Merci de me confirmer le créneau qui vous convient le mieux. Je vous adresserai ensuite la confirmation du rendez-vous Outlook.

Bien cordialement,

Casa Vostra SARL
Carrelage · Faïence · Chape · Rénovation
contact@casavostra.corsica
SIREN 918 824 921`;

    setEmailTemplate(template);
    setEmailTemplateCopied(false);
  };

  const copyEmailTemplate = async () => {
    if (!emailTemplate) return;
    try {
      await navigator.clipboard.writeText(emailTemplate);
      setEmailTemplateCopied(true);
      toast.success("Modèle d’e-mail copié");
      window.setTimeout(() => setEmailTemplateCopied(false), 2200);
    } catch {
      toast.error("La copie automatique n’est pas disponible sur cet appareil.");
    }
  };

  const openPreparedEmail = () => {
    if (!emailTemplate || !normalizedEmail) return;
    const subject = "Votre projet Casa Vostra — proposition de rendez-vous";
    window.location.href = `mailto:${encodeURIComponent(normalizedEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailTemplate.replace(/^Objet[^\\n]*\\n\\n/, ""))}`;
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
              src="/manus-storage/Logosvg(1)_a625f43d.png"
              alt="Casa Vostra — votre projet, notre savoir-faire"
              className="h-11 w-auto max-w-[210px] object-contain object-left sm:h-14 sm:max-w-[250px]"
            />
          </button>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#424245]">
            <button onClick={() => scrollToSection("approche")} className="hover:text-[#1D1D1F] transition-colors">Notre approche</button>
            <button onClick={() => scrollToSection("expertises")} className="hover:text-[#1D1D1F] transition-colors">Expertises</button>
            <button onClick={() => scrollToSection("galerie")} className="hover:text-[#1D1D1F] transition-colors">Galerie</button>
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
            <button onClick={() => scrollToSection("galerie")} className="text-left py-2 font-medium text-lg border-b border-[#1D1D1F]/5">Galerie</button>
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
                  src="/manus-storage/casa-vostra-hero-carrelage_8724129d.jpg" 
                  alt="Sol en carrelage grand format avec joints précis dans un intérieur contemporain, Casa Vostra" 
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
              De la préparation des supports aux détails de faïence.
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

      {/* Gallery Section */}
      <section id="galerie" className="py-24 bg-[#EAE8E4]/45 border-y border-[#1D1D1F]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-widest text-[#8C6D53] block mb-3">03 / GALERIE CARRELAGE XXL</span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight leading-tight">Des matières qui prennent toute leur place.</h2>
              <p className="text-[#6E6E73] text-base leading-relaxed mt-5 max-w-xl">Découvrez une sélection de réalisations réelles Casa Vostra : grands formats, salles d’eau et détails de finition.</p>
            </div>
            <a href="/carrelage-xxl#galerie" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D1D1F] underline decoration-[#8C6D53] decoration-2 underline-offset-8 hover:text-[#8C6D53] transition-colors whitespace-nowrap">Explorer la galerie complète <ArrowRight className="w-4 h-4" /></a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="/carrelage-xxl#galerie" className="group relative sm:col-span-2 lg:row-span-2 min-h-[320px] lg:min-h-[460px] overflow-hidden rounded-2xl bg-[#D8D2CA] shadow-[0_16px_40px_rgba(29,29,31,0.1)]">
              <img src="/manus-storage/7B14C597-3D1D-4F75-9D2E-B2CF772BACD4_4dd2cb62.jpg" alt="Faïence murale fine et escalier intérieur habillé, réalisation Casa Vostra" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute bottom-0 left-0 right-0 p-6 text-white"><span className="block text-xs font-mono uppercase tracking-widest text-[#E3D5C9]">Faïence</span><span className="block font-serif text-2xl mt-2">Lignes fines.</span></span>
            </a>
            <a href="/carrelage-xxl#galerie" className="group relative min-h-[220px] overflow-hidden rounded-2xl bg-[#D8D2CA]"><img src="/manus-storage/IMG_2204_428a3b72.jpeg" alt="Salle d’eau avec revêtement mural et niche, réalisation Casa Vostra" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" /><span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" /><span className="absolute bottom-0 p-5 text-white"><span className="block text-xs font-mono uppercase tracking-widest text-[#E3D5C9]">Salle d’eau</span><span className="block font-serif text-xl mt-2">Matière murale.</span></span></a>
            <a href="/carrelage-xxl#galerie" className="group relative min-h-[220px] overflow-hidden rounded-2xl bg-[#D8D2CA]"><img src="/manus-storage/IMG_1542_ff1024d3.jpeg" alt="Pose de grands carreaux au sol avec système de nivellement, réalisation Casa Vostra" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" /><span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" /><span className="absolute bottom-0 p-5 text-white"><span className="block text-xs font-mono uppercase tracking-widest text-[#E3D5C9]">Pose grand format</span><span className="block font-serif text-xl mt-2">Le détail juste.</span></span></a>
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

              {/* Localisation et budget / fourniture */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#1D1D1F]">
                    Localisation (Ville / Code Postal)
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ex: Porto-Vecchio, Lecci..." 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#1D1D1F]/20 focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] text-sm bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#1D1D1F]">
                    Budget estimé des travaux
                  </label>
                  <select 
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#1D1D1F]/20 focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] text-sm bg-white"
                  >
                    <option value="Moins de 5 000 €">Moins de 5 000 €</option>
                    <option value="5 000 € à 15 000 €">5 000 € à 15 000 €</option>
                    <option value="15 000 € à 30 000 €">15 000 € à 30 000 €</option>
                    <option value="Plus de 30 000 €">Plus de 30 000 €</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#1D1D1F]">
                    Fourniture des matériaux
                  </label>
                  <select 
                    value={supplyScope}
                    onChange={(e) => setSupplyScope(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#1D1D1F]/20 focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] text-sm bg-white"
                  >
                    <option value="Fourniture par le client">Fourniture par le client</option>
                    <option value="Fourniture & Pose (Clé en main)">Fourniture & Pose (Clé en main)</option>
                    <option value="Conseil + Pose">Conseil + Pose</option>
                  </select>
                </div>
              </div>

              {/* Précisions libres */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#1D1D1F]">
                  Précisions techniques (dépose, contraintes d'accès, types de carreaux...)
                </label>
                <textarea 
                  rows={3}
                  placeholder="Ex: Dépose ancien carrelage sur 50m², préparation de chape fluide, carreaux grand format 120x120 fournis..." 
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#1D1D1F]/20 focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] text-sm bg-white"
                />
              </div>

              {/* Médias du projet */}
              <div className="pt-6 border-t border-[#1D1D1F]/10 space-y-4">
                <div>
                  <h3 className="font-serif text-lg font-medium">Photos, plans et documents du projet</h3>
                  <p className="text-xs leading-5 text-[#6E6E73] mt-1">Ajoutez jusqu’à 6 fichiers pour nous aider à comprendre le chantier : photos des supports, plan, croquis ou PDF. 10 Mo maximum par fichier, 35 Mo au total.</p>
                </div>
                <label htmlFor="project-media" className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#1D1D1F]/20 bg-[#FBFBFA] px-6 py-7 text-center transition-colors hover:border-[#8C6D53] hover:bg-[#8C6D53]/5">
                  <FileText className="h-7 w-7 text-[#8C6D53]" />
                  <span className="mt-3 text-sm font-semibold text-[#1D1D1F]">Ajouter des photos ou un plan</span>
                  <span className="mt-1 text-xs text-[#6E6E73]">JPG, PNG, WEBP, PDF, DWG ou DXF</span>
                  <input
                    id="project-media"
                    type="file"
                    multiple
                    accept="image/*,.pdf,.dwg,.dxf"
                    className="sr-only"
                    onChange={(event) => {
                      const selectedFiles = Array.from(event.currentTarget.files ?? []);
                      const allowedExtensions = ["jpg", "jpeg", "png", "webp", "heic", "pdf", "dwg", "dxf"];
                      const validFiles = selectedFiles.filter((file) => {
                        const extension = file.name.toLowerCase().split(".").pop() ?? "";
                        return allowedExtensions.includes(extension) && file.size <= 10 * 1024 * 1024;
                      }).slice(0, 6);
                      const maxTotalBytes = 35 * 1024 * 1024;
                      const filesWithinTotalLimit: File[] = [];
                      let totalBytes = 0;
                      for (const file of validFiles) {
                        if (totalBytes + file.size <= maxTotalBytes) {
                          filesWithinTotalLimit.push(file);
                          totalBytes += file.size;
                        }
                      }

                      if (selectedFiles.length > 6) {
                        toast.error("Vous pouvez sélectionner 6 fichiers maximum.");
                      }
                      if (validFiles.length !== Math.min(selectedFiles.length, 6)) {
                        toast.error("Certains fichiers ont été ignorés : format non accepté ou taille supérieure à 10 Mo.");
                      }
                      if (filesWithinTotalLimit.length !== validFiles.length) {
                        toast.error("Les pièces jointes sont limitées à 35 Mo au total.");
                      }
                      setProjectFiles(filesWithinTotalLimit);
                    }}
                  />
                </label>
                {projectFiles.length > 0 && (
                  <div className="grid gap-2 sm:grid-cols-2" aria-live="polite">
                    {projectFiles.map((file) => (
                      <div key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between gap-3 rounded-xl border border-[#1D1D1F]/10 bg-white px-3 py-2 text-xs text-[#424245]">
                        <span className="min-w-0 truncate">{file.name}</span>
                        <span className="shrink-0 text-[#8C6D53]">{(file.size / 1024 / 1024).toFixed(1)} Mo</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[11px] leading-5 text-[#8A8A8F]">Les fichiers sélectionnés sont enregistrés avec votre brief et transmis directement depuis le site. Aucun e-mail ne s’ouvre sur votre appareil.</p>
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
                      id="contact-phone"
                      type="tel" 
                      required
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="06 12 34 56 78" 
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      aria-invalid={showPhoneError}
                      aria-describedby="contact-phone-hint"
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] text-sm bg-white ${showPhoneError ? "border-red-400 focus:ring-red-300" : isPhoneValid ? "border-emerald-400 focus:ring-emerald-300" : "border-[#1D1D1F]/20"}`}
                    />
                    <p id="contact-phone-hint" aria-live="polite" className={`mt-1 text-[11px] ${showPhoneError ? "text-red-600" : isPhoneValid ? "text-emerald-700" : "text-[#8A8A8F]"}`}>
                      {showPhoneError ? "Format attendu : 06 12 34 56 78 ou +33 6 12 34 56 78." : isPhoneValid ? "Numéro valide." : "Téléphone français requis."}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6E6E73] mb-1">E-mail <span className="text-[#8C6D53]">*</span></label>
                    <input 
                      id="contact-email"
                      type="email" 
                      required
                      inputMode="email"
                      autoComplete="email"
                      placeholder="jean@exemple.fr" 
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      aria-invalid={showEmailError}
                      aria-describedby="contact-email-hint"
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] text-sm bg-white ${showEmailError ? "border-red-400 focus:ring-red-300" : isEmailValid ? "border-emerald-400 focus:ring-emerald-300" : "border-[#1D1D1F]/20"}`}
                    />
                    <p id="contact-email-hint" aria-live="polite" className={`mt-1 text-[11px] ${showEmailError ? "text-red-600" : isEmailValid ? "text-emerald-700" : "text-[#8A8A8F]"}`}>
                      {showEmailError ? "Saisissez une adresse e-mail valide, par exemple jean@exemple.fr." : isEmailValid ? "Adresse e-mail valide." : "E-mail requis pour recevoir la confirmation."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit"
                  disabled={submitLead.isPending || !contactFieldsValid}
                  className="w-full bg-[#1D1D1F] hover:bg-[#333336] text-white py-6 rounded-2xl font-medium text-base shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {submitLead.isPending ? "Transmission en cours..." : "Transmettre mon brief directement"} <ArrowRight className="w-5 h-5" />
                </Button>
                <p className="text-center text-xs text-[#6E6E73] mt-3">
                  Envoi direct et sécurisé à Casa Vostra (contact@casavostra.corsica). Téléphone et e-mail obligatoires.
                </p>
              </div>

            </form>
          ) : (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#1D1D1F]/10 shadow-xl space-y-6 text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-[#8C6D53]/10 text-[#8C6D53] rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-3xl font-normal">Brief transmis avec succès.</h3>
              <p className="text-[#6E6E73] text-sm max-w-lg mx-auto">
                Votre demande a été enregistrée et transmise directement à <strong>{CONTACT_EMAIL}</strong>. Notre équipe va l’étudier et vous recontacter.
              </p>

              <div className="bg-[#FBFBFA] p-6 rounded-2xl border border-[#1D1D1F]/10 text-left font-mono text-xs whitespace-pre-wrap text-[#1D1D1F] max-w-xl mx-auto overflow-x-auto">
                {summaryText}
              </div>

              <p className="text-center text-xs text-[#6E6E73] max-w-xl mx-auto">Votre brief a été enregistré directement sur le site. Casa Vostra reviendra vers vous après étude de votre demande.</p>

              <div className="border-t border-[#1D1D1F]/10 pt-6 mt-6 text-left">
                <h4 className="font-serif text-xl font-medium mb-2">Planifier votre échange technique immédiatement</h4>
                <p className="text-xs text-[#6E6E73] mb-4">Sélectionnez un créneau ci-dessous pour planifier directement votre échange avec Casa Vostra. Le rendez-vous sera inscrit dans l’agenda Outlook avec le résumé de votre chantier :</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  {[
                    "Demain à 09h00 (Téléphone / Visio)",
                    "Demain à 14h30 (Téléphone / Visio)",
                    "Après-demain à 10h00 (Téléphone / Visio)"
                  ].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-xl border text-xs font-medium transition-all text-left ${
                        selectedSlot === slot 
                          ? "border-[#8C6D53] bg-[#8C6D53]/10 text-[#1D1D1F]" 
                          : "border-[#1D1D1F]/15 bg-white text-[#424245] hover:border-[#1D1D1F]/40"
                      }`}
                    >
                      <span className="block font-semibold mb-1">Créneau disponible</span>
                      <span>{slot}</span>
                    </button>
                  ))}
                </div>

                {slotConfirmed ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                    Rendez-vous confirmé et enregistré dans Outlook : <strong>{selectedSlot}</strong>. Casa Vostra vous contactera à ce moment.
                  </div>
                ) : (
                  <Button
                    disabled={!selectedSlot || !leadId || assignSlot.isPending}
                    onClick={() => {
                      if (!selectedSlot || !leadId) return;
                      assignSlot.mutate({ leadId, selectedSlot });
                    }}
                    className="w-full bg-[#8C6D53] hover:bg-[#775a42] text-white py-4 rounded-xl text-sm font-medium mb-4"
                  >
                    {assignSlot.isPending ? "Réservation en cours..." : "Confirmer mon rendez-vous dans l’agenda"}
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-center pt-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setBriefSubmitted(false);
                    setLeadId(null);
                    setSelectedSlot(null);
                    setSlotConfirmed(false);
                  }}
                  className="border-[#1D1D1F]/20 text-[#1D1D1F] rounded-full px-8 py-3 text-sm font-medium"
                >
                  Modifier ou soumettre un autre brief
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
                src="/manus-storage/Logosvg(1)_a625f43d.png"
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
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#8C6D53]">Contact & siège</h4>
              <p className="text-sm text-[#A1A1A6] leading-6">Disponible pour vos chantiers neufs et rénovations en Corse-du-Sud.</p>
              <address className="not-italic text-sm leading-6 text-white">
                1 Résidence Padulella<br />
                20137 Lecci
              </address>
              <a href="mailto:contact@casavostra.corsica" className="block text-sm font-medium text-white transition-colors hover:text-[#E3D5C9]">contact@casavostra.corsica</a>
              <p className="text-xs text-[#8C6D53] font-mono">SARL · SIREN 918 824 921</p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A1A1A6]">
            <p>© {new Date().getFullYear()} Casa Vostra SARL · SIREN 918 824 921. Tous droits réservés.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="https://www.societe.com/societe/casa-vostra-918824921.html" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Fiche entreprise</a>
              <a href="mailto:contact@casavostra.corsica" className="hover:text-white transition-colors">Nous contacter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
