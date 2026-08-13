/**
 * CASA VOSTRA — Atelier de précision
 * Direction: minimalisme éditorial minéral, lignes de calibration, ivoire/graphite/argile.
 * Les interactions servent une seule intention : préparer une demande de rénovation qualifiée.
 */
import { useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  FileCheck2,
  Menu,
  Ruler,
  X,
} from "lucide-react";
import { toast } from "sonner";

const heroImage = "/manus-storage/casa-vostra-hero_f2312aa4.jpg";
const materialImage = "/manus-storage/casa-vostra-bathroom_7e129cc3.webp";
const livingImage = "/manus-storage/casa-vostra-living_57bb5ec6.jpg";
const markImage = "/manus-storage/casa-vostra-mark_89f201b3.png";

const domains = [
  "Salles de bains & douches",
  "Sols grand format",
  "Faïence & murs décoratifs",
  "Rénovation intérieure",
];

const briefSteps = [
  ["01", "La pièce", "Les espaces concernés et la nature de votre rénovation."],
  ["02", "Le cadre", "Une enveloppe et un calendrier, même approximatifs."],
  ["03", "Le rendez-vous", "Vos disponibilités pour avancer sur du concret."],
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [briefReady, setBriefReady] = useState(false);

  const scrollToProject = () => {
    document.getElementById("projet")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  const handleBrief = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name")?.toString().trim() || "Votre projet";
    const summary = [
      `Projet Casa Vostra — ${name}`,
      `Type : ${formData.get("type") || "Non précisé"}`,
      `Espaces : ${formData.get("spaces") || "Non précisés"}`,
      `Budget indicatif : ${formData.get("budget") || "Non précisé"}`,
      `Échéance : ${formData.get("timing") || "Non précisée"}`,
      `Détail : ${formData.get("details") || "Non précisé"}`,
    ].join("\n");

    void navigator.clipboard?.writeText(summary);
    setBriefReady(true);
    toast.success("Votre brief est structuré et prêt à être transmis.");
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#accueil" aria-label="Casa Vostra — accueil">
          <img src={markImage} alt="" className="brand-mark" />
          <span className="brand-wordmark">CASA VOSTRA</span>
          <span className="brand-divider" aria-hidden="true" />
          <span className="brand-subtitle">Rénovation</span>
        </a>

        <nav className="desktop-nav" aria-label="Navigation principale">
          <a href="#approche">Notre approche</a>
          <a href="#savoir-faire">Savoir-faire</a>
          <button type="button" onClick={scrollToProject} className="nav-cta">
            Préparer mon projet <ArrowUpRight size={15} strokeWidth={1.8} />
          </button>
        </nav>

        <button
          type="button"
          className="menu-trigger"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Fermer la navigation" : "Ouvrir la navigation"}
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={22} />}
        </button>

        {menuOpen && (
          <div className="mobile-menu">
            <a href="#approche" onClick={() => setMenuOpen(false)}>Notre approche</a>
            <a href="#savoir-faire" onClick={() => setMenuOpen(false)}>Savoir-faire</a>
            <button type="button" onClick={scrollToProject}>Préparer mon projet <ArrowUpRight size={16} /></button>
          </div>
        )}
      </header>

      <main>
        <section id="accueil" className="hero-section">
          <img className="hero-image" src={heroImage} alt="Salle de bains contemporaine aux matières minérales" />
          <div className="hero-wash" aria-hidden="true" />
          <div className="hero-layout">
            <div className="hero-copy reveal-up">
              <p className="eyebrow"><span>01</span> Rénovation intérieure & finitions</p>
              <h1>Faire de votre<br />rénovation une<br /><em>évidence.</em></h1>
              <p className="hero-intro">Carrelage, faïence et rénovation haut de gamme. Casa Vostra transforme les idées déjà mûries en espaces justes, durables et singuliers.</p>
              <div className="hero-actions">
                <button type="button" onClick={scrollToProject} className="button-primary">
                  Préparer mon projet <ArrowUpRight size={18} />
                </button>
                <a href="#approche" className="text-link">Découvrir notre méthode <ArrowDown size={16} /></a>
              </div>
            </div>

            <aside className="hero-note reveal-up" aria-label="Information projet">
              <div className="note-topline"><span>AVANT LE PREMIER ÉCHANGE</span><span>01 / 03</span></div>
              <p>Un projet bien cadré permet une première réponse réellement utile.</p>
              <button type="button" onClick={scrollToProject} className="quiet-action">
                Le brief projet en 4 min <ArrowUpRight size={16} />
              </button>
            </aside>
          </div>
          <div className="hero-specs" aria-label="Spécialités Casa Vostra">
            <span>CARRELAGE</span><i /> <span>FAÏENCE</span><i /> <span>RÉNOVATION</span><i /> <span>FINITIONS</span>
          </div>
        </section>

        <section id="approche" className="approach-section section-rule">
          <div className="section-index"><span>02</span><span>LA MÉTHODE</span></div>
          <div className="approach-main">
            <p className="eyebrow"><span>CASA VOSTRA</span> Une première discussion qui a du sens</p>
            <h2>Votre temps mérite mieux qu’un échange <em>imprécis.</em></h2>
            <p className="large-copy">Avant de vous proposer un rendez-vous, nous vous invitons à poser les fondamentaux : l’espace, l’ambition, l’enveloppe et le rythme du projet. Vous gagnez en clarté. Nous arrivons préparés.</p>
          </div>
          <div className="approach-checks">
            {[
              "Une demande structurée en quelques minutes",
              "Des questions utiles, sans jargon inutile",
              "Un premier échange focalisé sur vos priorités",
            ].map((item) => (
              <div key={item} className="check-line"><Check size={17} strokeWidth={1.7} /><span>{item}</span></div>
            ))}
          </div>
        </section>

        <section id="savoir-faire" className="expertise-section">
          <div className="section-header">
            <div className="section-index"><span>03</span><span>SAVOIR-FAIRE</span></div>
            <p>Des surfaces choisies, une pose maîtrisée, une rénovation pensée dans son ensemble.</p>
          </div>
          <div className="expertise-grid">
            <div className="expertise-list">
              {domains.map((domain, index) => (
                <div className="expertise-row" key={domain}>
                  <span>0{index + 1}</span>
                  <h3>{domain}</h3>
                  <ArrowUpRight size={20} strokeWidth={1.45} />
                </div>
              ))}
            </div>
            <figure className="material-figure">
              <img src={materialImage} alt="Salle de bains raffinée aux finitions minérales" />
              <figcaption><span>ÉTUDE MATIÈRE</span><span>01 — 04</span></figcaption>
            </figure>
          </div>
        </section>

        <section className="space-section">
          <div className="space-image-wrap">
            <img src={livingImage} alt="Espace de vie contemporain rénové avec sol minéral" />
            <div className="image-label"><span>LE PROJET JUSTE</span><span>Une matière à sa place</span></div>
          </div>
          <div className="space-copy">
            <p className="eyebrow"><span>04</span> Une finition qui tient dans le temps</p>
            <h2>La qualité se voit. La précision se <em>ressent.</em></h2>
            <p>Du choix du format à la cohérence des joints, nous accordons une attention minutieuse à chaque transition. Parce qu’une belle rénovation ne se résume jamais à une belle matière.</p>
            <div className="metric-grid" aria-label="Principes Casa Vostra">
              <div><Ruler size={20} strokeWidth={1.5} /><span>DES DÉTAILS<br />MAÎTRISÉS</span></div>
              <div><FileCheck2 size={20} strokeWidth={1.5} /><span>UN PROJET<br />CADRÉ</span></div>
              <div><Clock3 size={20} strokeWidth={1.5} /><span>UN TEMPS<br />RESPECTÉ</span></div>
            </div>
          </div>
        </section>

        <section id="projet" className="project-section">
          <div className="project-intro">
            <div className="section-index"><span>05</span><span>VOTRE PROJET</span></div>
            <h2>Commençons par les <em>bonnes informations.</em></h2>
            <p>Votre brief nous donne le contexte nécessaire pour vous répondre avec méthode. Il ne remplace pas la visite : il permet de l’organiser au bon moment.</p>
            <div className="brief-steps">
              {briefSteps.map(([number, title, text]) => (
                <div className="brief-step" key={number}>
                  <span>{number}</span>
                  <div><h3>{title}</h3><p>{text}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className="project-form-wrap">
            <div className="form-head">
              <span>BRIEF PROJET</span>
              <span>≈ 4 MIN</span>
            </div>
            <form onSubmit={handleBrief} className="project-form">
              <div className="field-full">
                <label htmlFor="name">Votre nom</label>
                <input id="name" name="name" placeholder="Nom et prénom" required />
              </div>
              <div className="form-split">
                <div>
                  <label htmlFor="type">Votre projet</label>
                  <div className="select-wrap"><select id="type" name="type" defaultValue="" required><option value="" disabled>Choisir</option><option>Salle de bains</option><option>Pièce de vie</option><option>Rénovation complète</option><option>Autre projet</option></select><ChevronDown size={16} /></div>
                </div>
                <div>
                  <label htmlFor="spaces">Surface concernée</label>
                  <input id="spaces" name="spaces" placeholder="Ex. 35 m²" required />
                </div>
              </div>
              <div className="form-split">
                <div>
                  <label htmlFor="budget">Enveloppe estimée</label>
                  <div className="select-wrap"><select id="budget" name="budget" defaultValue="" required><option value="" disabled>Choisir</option><option>À préciser ensemble</option><option>Moins de 10 000 €</option><option>10 000 – 25 000 €</option><option>25 000 – 50 000 €</option><option>Plus de 50 000 €</option></select><ChevronDown size={16} /></div>
                </div>
                <div>
                  <label htmlFor="timing">Échéance souhaitée</label>
                  <div className="select-wrap"><select id="timing" name="timing" defaultValue="" required><option value="" disabled>Choisir</option><option>Dans les 3 mois</option><option>Dans les 3 à 6 mois</option><option>Plus de 6 mois</option><option>À définir</option></select><ChevronDown size={16} /></div>
                </div>
              </div>
              <div className="field-full">
                <label htmlFor="details">Ce que vous avez déjà défini</label>
                <textarea id="details" name="details" rows={3} placeholder="Vos priorités, inspirations, contraintes ou plans disponibles…" />
              </div>
              <label className="consent"><input type="checkbox" required /><span>J’accepte que Casa Vostra utilise ces informations pour préparer une réponse à mon projet.</span></label>
              <button type="submit" className="button-primary button-form">Structurer mon brief <ArrowUpRight size={18} /></button>
              {briefReady && <p className="form-success" role="status"><Check size={16} /> Brief prêt. Son récapitulatif a été copié pour votre prise de contact.</p>}
              <p className="form-note">Ce brief est conçu pour rendre le premier échange plus précis, pas plus long.</p>
            </form>
          </div>
        </section>

        <section className="final-cta">
          <p className="eyebrow"><span>CASA VOSTRA</span> Rénovation intérieure & finitions</p>
          <h2>Une rénovation ne se <em>devine pas.</em><br />Elle se prépare.</h2>
          <button type="button" onClick={scrollToProject} className="button-light">Préparer mon projet <ArrowUpRight size={18} /></button>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#accueil" aria-label="Retour à l'accueil Casa Vostra">
          <img src={markImage} alt="" className="brand-mark" />
          <span className="brand-wordmark">CASA VOSTRA</span>
        </a>
        <p>Rénovation intérieure, carrelage et faïence haut de gamme.</p>
        <a className="back-top" href="#accueil">Retour en haut <ArrowUpRight size={15} /></a>
      </footer>

      <button type="button" onClick={scrollToProject} className="mobile-project-cta">Préparer mon projet <ArrowUpRight size={17} /></button>
    </div>
  );
}
