import { useState, useEffect, type FormEvent } from "react";
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
  const [adminOpen, setAdminOpen] = useState(false);
  const [urlValidatedMsg, setUrlValidatedMsg] = useState<string | null>(null);

  const validateLeadMutation = trpc.leads.validateLead.useMutation({
    onSuccess: () => {
      setUrlValidatedMsg("Demande validée avec succès ! Le client a désormais accès aux créneaux Outlook.");
      toast.success("Demande validée par e-mail");
    },
    onError: () => {
      toast.error("Échec de la validation");
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const validateId = params.get("validateLead");
    if (validateId) {
      const lid = parseInt(validateId, 10);
      if (!isNaN(lid)) {
        validateLeadMutation.mutate({ leadId: lid });
      }
    }
  }, []);

  const leadsQuery = trpc.leads.list.useQuery(undefined, { enabled: adminOpen, refetchInterval: 5000 });
  const validateLead = trpc.leads.validateLead.useMutation({
    onSuccess: () => {
      toast.success("Demande validée", { description: "Le client a désormais accès aux créneaux Outlook." });
      leadsQuery.refetch();
    },
    onError: () => {
      toast.error("Échec de la validation");
    }
  });

  const leadStatusQuery = trpc.leads.getStatus.useQuery(
    { leadId: leadId || 0 },
    { enabled: briefSubmitted && leadId !== null, refetchInterval: 4000 }
  );
  const isLeadValidated = leadStatusQuery.data?.status === "validated" || leadStatusQuery.data?.status === "rdv_requested";

  const normalizedPhone = contactPhone.trim();
  const normalizedEmail = contactEmail.trim();
  const isPhoneValid = FRENCH_PHONE_PATTERN.test(normalizedPhone);
  const isEmailValid = EMAIL_PATTERN.test(normalizedEmail);
  const showPhoneError = normalizedPhone.length > 0 && !isPhoneValid;
  const showEmailError = normalizedEmail.length > 0 && !isEmailValid;
  const isSurfaceValid = surface.trim().length > 0;
  const isLocationValid = location.trim().length > 0;
  const isDetailsValid = details.trim().length > 0;
  const isNameValid = contactName.trim().length > 0;
  const hasFiles = projectFiles.length > 0;

  const contactFieldsValid = isPhoneValid && isEmailValid && isSurfaceValid && isLocationValid && isDetailsValid && isNameValid && hasFiles;

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
      toast.error("Veuillez remplir tous les champs obligatoires (surface, localisation, précisions, nom, téléphone, e-mail) et joindre au moins une photo ou un plan.");
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

          {/* Nouveau schéma synoptique interactif en cartes HTML style Apple */}
          <div className="mb-16 bg-white p-6 sm:p-10 rounded-3xl border border-[#1D1D1F]/10 shadow-sm">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h3 className="font-serif text-2xl font-normal mb-2">Schéma synoptique du parcours client & entreprise</h3>
              <p className="text-sm text-[#6E6E73]">De la transmission du brief sur le site jusqu'à l'intégration dans votre planning Outlook.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {/* Étape 1 */}
              <div className="bg-[#FBFBFA] p-5 rounded-2xl border border-[#1D1D1F]/10 flex flex-col justify-between relative group hover:border-[#8C6D53] transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#1D1D1F] text-white">01. Client</span>
                    <span className="w-2 h-2 rounded-full bg-[#8C6D53]"></span>
                  </div>
                  <h4 className="font-serif font-medium text-base mb-2">Transmission du Brief</h4>
                  <p className="text-xs text-[#6E6E73] leading-relaxed">Surface, budget, localisation, coordonnées obligatoires et pièces jointes (photos/plans).</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1D1D1F]/5 text-[11px] font-mono text-[#8C6D53]">Action sur le site</div>
              </div>

              {/* Étape 2 */}
              <div className="bg-[#FBFBFA] p-5 rounded-2xl border border-[#1D1D1F]/10 flex flex-col justify-between relative group hover:border-[#8C6D53] transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#8C6D53] text-white">02. Système</span>
                    <span className="w-2 h-2 rounded-full bg-[#8C6D53]"></span>
                  </div>
                  <h4 className="font-serif font-medium text-base mb-2">Sécurisation & Synthèse</h4>
                  <p className="text-xs text-[#6E6E73] leading-relaxed">Notification immédiate par e-mail à contact@casavostra.corsica et génération d'une synthèse IA.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1D1D1F]/5 text-[11px] font-mono text-[#8C6D53]">Traitement auto</div>
              </div>

              {/* Étape 3 */}
              <div className="bg-[#1D1D1F] text-white p-5 rounded-2xl border border-[#1D1D1F] flex flex-col justify-between relative shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/20 text-white">03. Artisan</span>
                    <span className="w-2 h-2 rounded-full bg-[#8C6D53]"></span>
                  </div>
                  <h4 className="font-serif font-medium text-base mb-2 text-white">Validation en 1 Clic</h4>
                  <p className="text-xs text-[#A1A1A6] leading-relaxed">L'artisan contrôle le chantier depuis son e-mail et clique sur le lien pour valider le projet.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-[#E3D5C9]">Décision clé</div>
              </div>

              {/* Étape 4 */}
              <div className="bg-[#FBFBFA] p-5 rounded-2xl border border-[#1D1D1F]/10 flex flex-col justify-between relative group hover:border-[#8C6D53] transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#8C6D53] text-white">04. Client</span>
                    <span className="w-2 h-2 rounded-full bg-[#8C6D53]"></span>
                  </div>
                  <h4 className="font-serif font-medium text-base mb-2">Accès Planning</h4>
                  <p className="text-xs text-[#6E6E73] leading-relaxed">Le client reçoit un e-mail avec son accès sécurisé pour choisir son créneau d'échange.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1D1D1F]/5 text-[11px] font-mono text-[#8C6D53]">Réservation</div>
              </div>

              {/* Étape 5 */}
              <div className="bg-[#FBFBFA] p-5 rounded-2xl border border-[#1D1D1F]/10 flex flex-col justify-between relative group hover:border-[#8C6D53] transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#1D1D1F] text-white">05. Planning</span>
                    <span className="w-2 h-2 rounded-full bg-[#8C6D53]"></span>
                  </div>
                  <h4 className="font-serif font-medium text-base mb-2">Agenda Outlook</h4>
                  <p className="text-xs text-[#6E6E73] leading-relaxed">Le rendez-vous s'inscrit automatiquement dans votre calendrier Outlook sans échange inutile.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1D1D1F]/5 text-[11px] font-mono text-[#8C6D53]">Synchronisé</div>
              </div>
            </div>
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

          {urlValidatedMsg && (
            <div className="mb-8 p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center shadow-lg animate-in fade-in duration-300">
              <h3 className="font-serif text-2xl font-medium mb-2">Validation propriétaire réussie !</h3>
              <p className="text-sm">{urlValidatedMsg}</p>
            </div>
          )}

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
                    Surface estimée (en m²) <span className="text-[#8C6D53]">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
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
                    Localisation (Ville / Code Postal) <span className="text-[#8C6D53]">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
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
                  Précisions techniques (dépose, contraintes d'accès, types de carreaux...) <span className="text-[#8C6D53]">*</span>
                </label>
                <textarea 
                  rows={3}
                  required
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
                    <label className="block text-xs font-medium text-[#6E6E73] mb-1">Votre nom <span className="text-[#8C6D53]">*</span></label>
                    <input 
                      type="text" 
                      required
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

              {/* Synthèse IA du projet */}
              <div className="bg-[#F4EFEA] p-6 rounded-2xl border border-[#8C6D53]/20 text-left max-w-xl mx-auto space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#8C6D53]">
                  <Sparkles className="w-4 h-4" /> Synthèse IA de votre besoin
                </div>
                <p className="text-sm text-[#1D1D1F] font-serif leading-relaxed italic">
                  "{leadStatusQuery.data?.aiSummary || "Analyse de votre projet de pose et finitions par Casa Vostra en cours..."}"
                </p>
                <p className="text-[11px] text-[#6E6E73]">
                  Cette synthèse résume vos critères pour valider rapidement vos attentes dès notre premier échange.
                </p>
              </div>

              <div className="bg-[#FBFBFA] p-6 rounded-2xl border border-[#1D1D1F]/10 text-left font-mono text-xs whitespace-pre-wrap text-[#1D1D1F] max-w-xl mx-auto overflow-x-auto">
                {summaryText}
              </div>

              <p className="text-center text-xs text-[#6E6E73] max-w-xl mx-auto">Votre brief a été enregistré directement sur le site. Casa Vostra reviendra vers vous après étude de votre demande.</p>

              <div className="border-t border-[#1D1D1F]/10 pt-6 mt-6 text-left">
                {isLeadValidated ? (
                  <div>
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium mb-4">
                      ✓ Votre demande a été validée par Casa Vostra. Vous pouvez désormais sélectionner votre créneau d'échange technique ci-dessous :
                    </div>
                    <h4 className="font-serif text-xl font-medium mb-2">Choisissez votre créneau Outlook</h4>
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
                      <div
                        role="status"
                        aria-live="polite"
                        className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 duration-500 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-emerald-900 text-center shadow-sm"
                      >
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white motion-safe:animate-in motion-safe:zoom-in-95 duration-500">
                          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                        </div>
                        <h4 className="font-serif text-2xl font-medium mb-2">
                          Merci{contactName.trim() ? ` ${contactName.trim().split(/\\s+/)[0]}` : ""}, votre rendez-vous est confirmé.
                        </h4>
                        <p className="text-sm leading-relaxed mb-3">
                          Votre créneau du <strong>{selectedSlot}</strong> est bien enregistré dans le planning Casa Vostra.
                        </p>
                        <p className="text-xs text-emerald-800/80 leading-relaxed">
                          Un récapitulatif sera envoyé à <strong>{contactEmail}</strong>. Prochaine étape : nous préparerons votre échange technique à partir du brief transmis.
                        </p>
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
                ) : (
                  <div className="p-5 rounded-2xl bg-[#FBFBFA] border border-[#1D1D1F]/10 text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#8C6D53]/10 text-[#8C6D53] mb-1">
                      <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                    <h4 className="font-serif text-base font-medium text-[#1D1D1F]">Demande transmise — En attente d'analyse</h4>
                    <p className="text-xs text-[#6E6E73] max-w-md mx-auto leading-relaxed">
                      Votre brief a bien été reçu. Casa Vostra analyse votre projet et vos pièces jointes. Dès validation de votre dossier, vos accès aux créneaux Outlook s'activeront automatiquement ici.
                    </p>
                  </div>
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
            <div className="flex gap-6 mt-4 sm:mt-0 items-center">
              <button 
                onClick={() => setAdminOpen(true)}
                className="text-[#8C6D53] hover:text-white transition-colors font-medium underline underline-offset-4"
              >
                Espace Gestion Casa Vostra
              </button>
              <a href="https://www.societe.com/societe/casa-vostra-918824921.html" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Fiche entreprise</a>
              <a href="mailto:contact@casavostra.corsica" className="hover:text-white transition-colors">Nous contacter</a>
            </div>
          </div>

          {/* Admin Modal for Casa Vostra */}
          {adminOpen && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#1D1D1F] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 text-[#FBFBFA] shadow-2xl">
                <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-[#8C6D53] block mb-1">Administration interne</span>
                    <h3 className="font-serif text-2xl font-medium">Gestion des briefs & Validation</h3>
                  </div>
                  <button 
                    onClick={() => setAdminOpen(false)}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Microsoft 365 Secure OAuth Integration Box */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
                        <h4 className="font-serif text-sm font-medium text-white">Connexion Microsoft 365 & Outlook</h4>
                      </div>
                      <p className="text-xs text-[#A1A1A6]">
                        Connectez votre compte professionnel <strong>contact@casavostra.corsica</strong> en toute sécurité via Microsoft OAuth. Aucun mot de passe n'est requis.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        toast.success("Boîte contact@casavostra.corsica configurée", {
                          description: "Les e-mails de brief et les liens de validation sont routés directement vers votre messagerie professionnelle Microsoft 365."
                        });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-medium transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                    >
                      <span>M365 Actif & Connecté</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-[#A1A1A6] leading-relaxed">
                    Retrouvez ci-dessous les briefs reçus depuis le site. Cliquez sur <strong>« Valider la demande »</strong> pour débloquer l'accès aux créneaux Outlook pour le client concerné.
                  </p>

                  {leadsQuery.isLoading ? (
                    <div className="py-12 text-center text-sm text-[#A1A1A6]">Chargement des briefs...</div>
                  ) : leadsQuery.data && leadsQuery.data.length > 0 ? (
                    <div className="space-y-4">
                      {leadsQuery.data.map((lead: any) => {
                        let parsedMedia: any[] = [];
                        try {
                          parsedMedia = lead.mediaSummary ? JSON.parse(lead.mediaSummary) : [];
                        } catch {
                          parsedMedia = [];
                        }

                        return (
                          <div key={lead.id} className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs">
                              <div>
                                <span className="font-semibold text-white">#{lead.id} — {lead.contactName || "Anonyme"}</span>
                                <span className="ml-3 text-[#A1A1A6]">{lead.contactPhone} | {lead.contactEmail}</span>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider ${
                                lead.status === 'validated' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                lead.status === 'rdv_requested' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}>
                                {lead.status === 'validated' ? 'Validé (Créneaux débloqués)' : lead.status === 'rdv_requested' ? 'Rendez-vous planifié' : 'Nouveau (À valider)'}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#A1A1A6]">
                              <div>
                                <strong className="text-white">Prestation :</strong> {lead.projectType} ({lead.projectNature})<br />
                                <strong className="text-white">Surface / Budget :</strong> {lead.surface || "N/C"} m² | {lead.budget || "N/C"}<br />
                                <strong className="text-white">Fourniture :</strong> {lead.supplyScope || "N/C"}
                              </div>
                              <div>
                                <strong className="text-white">Localisation :</strong> {lead.location || "Non renseignée"}<br />
                                <strong className="text-white">Calendrier :</strong> {lead.timeline || "N/C"}<br />
                                {lead.selectedSlot && <strong className="text-emerald-400">Créneau choisi : {lead.selectedSlot}</strong>}
                              </div>
                            </div>

                            {lead.details && (
                              <p className="text-xs bg-black/30 p-3 rounded-xl text-[#D1D1D6] italic">
                                "{lead.details}"
                              </p>
                            )}

                            {parsedMedia.length > 0 && (
                              <div className="pt-2">
                                <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C6D53] block mb-1">Pièces jointes / Plans ({parsedMedia.length})</span>
                                <div className="flex flex-wrap gap-2">
                                  {parsedMedia.map((m: any, idx: number) => (
                                    <a
                                      key={idx}
                                      href={m.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white flex items-center gap-1.5 transition-colors"
                                    >
                                      📄 {m.name} ({(m.size / 1024 / 1024).toFixed(1)} Mo)
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="pt-3 flex justify-end gap-3">
                              {lead.status === 'new' && (
                                <Button
                                  onClick={() => validateLead.mutate({ leadId: lead.id })}
                                  disabled={validateLead.isPending}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-medium"
                                >
                                  Valider la demande et donner accès aux créneaux Outlook
                                </Button>
                              )}
                              {lead.status !== 'new' && (
                                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                                  ✓ Demande validée et active
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-sm text-[#A1A1A6]">Aucun brief enregistré pour le moment.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
