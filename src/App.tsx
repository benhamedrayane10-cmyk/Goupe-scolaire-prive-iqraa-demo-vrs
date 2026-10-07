import React, { useState, useId } from 'react';
import {
  GraduationCap,
  BookOpen,
  School,
  Bus,
  Utensils,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Calculator,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Award,
  Sparkles,
  Users,
  Menu,
  X,
  Send,
  Calendar,
  ArrowRight,
  FileText,
  HeartHandshake,
  Check,
  Printer,
  Compass,
  AlertCircle,
  HelpCircle,
  Building,
  Target,
  ExternalLink,
  Navigation,
  CreditCard
} from 'lucide-react';
import { SchoolLogo } from './components/SchoolLogo';
import { ChatbotWidget } from './components/ChatbotWidget';

// --- TYPES ---
type CycleType = 'primaire' | 'moyen' | 'secondaire';

interface PreRegistrationData {
  parentFullName: string;
  phone: string;
  email: string;
  district: string;
  studentFullName: string;
  studentBirthDate: string;
  cycle: CycleType;
  gradeLevel: string;
  needTransport: boolean;
  transportZone: string;
  needCanteen: boolean;
  needAfterSchoolCare: boolean;
  notes: string;
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCycleTab, setActiveCycleTab] = useState<CycleType>('primaire');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // --- SIMULATOR STATE ---
  const [simCycle, setSimCycle] = useState<CycleType>('moyen');
  const [simGrade, setSimGrade] = useState<string>('4am');
  const [simTransport, setSimTransport] = useState<boolean>(true);
  const [simTransportZone, setSimTransportZone] = useState<string>('belgaid');
  const [simCanteen, setSimCanteen] = useState<boolean>(true);

  // --- FORM STATE ---
  const [formData, setFormData] = useState<PreRegistrationData>({
    parentFullName: '',
    phone: '',
    email: '',
    district: 'Belgaïd',
    studentFullName: '',
    studentBirthDate: '',
    cycle: 'moyen',
    gradeLevel: '4ème Année Moyenne (Préparation B.E.M)',
    needTransport: true,
    transportZone: 'Belgaïd & Coopérative Panorama',
    needCanteen: true,
    needAfterSchoolCare: false,
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submittedModalOpen, setSubmittedModalOpen] = useState(false);
  const [submissionReference, setSubmissionReference] = useState('');
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Handle grade level options based on cycle
  const getGradeOptions = (cycle: CycleType) => {
    switch (cycle) {
      case 'primaire':
        return [
          { value: '1ap', label: '1ère Année Primaire (1 AP)' },
          { value: '2ap', label: '2ème Année Primaire (2 AP)' },
          { value: '3ap', label: '3ème Année Primaire (3 AP)' },
          { value: '4ap', label: '4ème Année Primaire (4 AP)' },
          { value: '5ap', label: '5ème Année Primaire (5 AP)' },
        ];
      case 'moyen':
        return [
          { value: '1am', label: '1ère Année Moyenne (1 AM)' },
          { value: '2am', label: '2ème Année Moyenne (2 AM)' },
          { value: '3am', label: '3ème Année Moyenne (3 AM)' },
          { value: '4am', label: '4ème Année Moyenne (4 AM - Préparation B.E.M)' },
        ];
      case 'secondaire':
        return [
          { value: '1as', label: '1ère Année Secondaire (Tronc Commun Sciences / Lettres)' },
          { value: '2as', label: '2ème Année Secondaire (Sciences Exp. / Maths / Gestion)' },
          { value: '3as', label: '3ème Année Secondaire (Classe Terminale - Préparation Baccalauréat)' },
        ];
    }
  };

  // Fees calculator logic (estimations indicatives en DZD / mois)
  const calculateTotalEstimate = () => {
    let baseTuition = 0;
    if (simCycle === 'primaire') baseTuition = 16000;
    if (simCycle === 'moyen') baseTuition = 19000;
    if (simCycle === 'secondaire') baseTuition = 23000;

    let transportCost = 0;
    if (simTransport) {
      if (simTransportZone === 'belgaid') transportCost = 5000;
      else if (simTransportZone === 'bir_el_djir') transportCost = 6500;
      else transportCost = 8000; // Grand Oran / Akid Lotfi
    }

    let canteenCost = simCanteen ? 7000 : 0;

    const monthlyTotal = baseTuition + transportCost + canteenCost;
    const trimestrialTotal = monthlyTotal * 3;

    return {
      baseTuition,
      transportCost,
      canteenCost,
      monthlyTotal,
      trimestrialTotal,
    };
  };

  const fees = calculateTotalEstimate();

  // Apply simulator values to pre-registration form
  const applySimulatorToForm = () => {
    const gradeLabel = getGradeOptions(simCycle).find(g => g.value === simGrade)?.label || 'Classe standard';
    let transportZoneLabel = 'Belgaïd & Proximité';
    if (simTransportZone === 'bir_el_djir') transportZoneLabel = 'Bir El Djir & Millenium';
    if (simTransportZone === 'grand_oran') transportZoneLabel = 'Akid Lotfi / Canastel / Grand Oran';

    setFormData(prev => ({
      ...prev,
      cycle: simCycle,
      gradeLevel: gradeLabel,
      needTransport: simTransport,
      transportZone: transportZoneLabel,
      needCanteen: simCanteen,
    }));

    // Trigger visual feedback and scroll to form
    setShowNotification('Configuration du simulateur transférée vers le formulaire avec succès !');
    setTimeout(() => setShowNotification(null), 4000);

    const formElement = document.getElementById('pre-inscription');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Validation & Form Submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!formData.parentFullName.trim()) {
      errors.parentFullName = 'Veuillez saisir le nom complet du parent / tuteur.';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Le numéro de téléphone est obligatoire.';
    } else if (!/^(05|06|07)\d{8}$/.test(formData.phone.replace(/[\s.-]/g, ''))) {
      errors.phone = 'Veuillez saisir un numéro algérien valide (ex: 0697 47 17 73 ou 05/06/07XXXXXXXX).';
    }
    if (!formData.studentFullName.trim()) {
      errors.studentFullName = "Veuillez saisir le nom et prénom de l'élève.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const refCode = `IQRAA-2026-${randomCode}`;
    setSubmissionReference(refCode);
    setSubmittedModalOpen(true);
  };

  const cycleDetails = {
    primaire: {
      title: 'Cycle Primaire',
      subtitle: 'Les Fondations du Savoir & Éveil Global',
      arabic: 'الطور الابتدائي',
      color: '#F97316',
      bgLight: 'bg-orange-50',
      borderLight: 'border-orange-200',
      textColor: 'text-orange-600',
      badgeColor: 'bg-orange-600 text-white',
      badgeBorder: 'border-orange-500',
      grades: '1ère à 5ème Année Primaire (AP)',
      ageRange: '6 - 10 ans',
      description:
        "Le cycle primaire chez IQRAA forge l'amour de l'apprentissage à travers un enseignement interactif, bienveillant et structuré. Nous consolidons les fondamentaux de la lecture, du calcul et des langues vivantes.",
      highlights: [
        "Programme national enrichi avec renforcement précoce en Français et Anglais",
        "Méthode syllabique éprouvée et ateliers réguliers de calcul mental rapide",
        "Éveil scientifique, logique spatiale et manipulation concrète",
        "Classes limitées à 18-20 élèves pour un suivi individualisé rigoureux",
        "Ateliers d'expression orale, calligraphie arabe et développement psycho-moteur",
      ],
      schedule: '08h00 - 15h45 (Mardi : 12h15)',
    },
    moyen: {
      title: 'Cycle Moyen / C.E.M',
      subtitle: 'Rigueur Méthodologique & Préparation au B.E.M',
      arabic: 'طور التعليم المتوسط (C.E.M)',
      color: '#0284C7',
      bgLight: 'bg-sky-50',
      borderLight: 'border-sky-200',
      textColor: 'text-sky-600',
      badgeColor: 'bg-sky-600 text-white',
      badgeBorder: 'border-sky-500',
      grades: '1ère à 4ème Année Moyenne (AM)',
      ageRange: '11 - 15 ans',
      description:
        "Une étape charnière d'autonomie intellectuelle. Le collège IQRAA structure la pensée critique, consolide les matières scientifiques et prépare nos élèves avec excellence aux épreuves officielles du B.E.M.",
      highlights: [
        "Professeurs spécialistes certifiés avec forte expérience pédagogique",
        "Laboratoires de sciences naturelles et physique pour expériences pratiques",
        "Examens blancs réguliers et devoirs surveillés hebdomadaires calibrés",
        "Programme de soutien ciblé et méthodologie de mémorisation efficace",
        "100% de taux de réussite aux sessions précédentes du B.E.M avec mentions",
      ],
      schedule: '08h00 - 15h45 (Mardi : 12h15)',
    },
    secondaire: {
      title: 'Cycle Secondaire / Lycée',
      subtitle: 'Excellence Académique & Réussite au Baccalauréat',
      arabic: 'الطور الثانوي / البكالوريا',
      color: '#DC2626',
      bgLight: 'bg-red-50',
      borderLight: 'border-red-200',
      textColor: 'text-red-600',
      badgeColor: 'bg-red-600 text-white',
      badgeBorder: 'border-red-500',
      grades: '1ère, 2ème et 3ème Année Secondaire (Terminale BAC)',
      ageRange: '15 - 18 ans',
      description:
        "Une pépinière d'ambition et de réussite. Le lycée IQRAA prépare les bacheliers aux exigences du Baccalauréat algérien et aux grandes filières d'excellence (Médecine, Polytechnique, Informatique, Économie).",
      highlights: [
        "Filières : Scientifique, Mathématiques, Gestion-Économie & Lettres",
        "Encadrement intensif par des enseignants chevronnés correcteurs du BAC",
        "Simulations réelles d'épreuves du Baccalauréat en conditions d'examen",
        "Conseil en orientation universitaire post-bac et préparation aux concours",
        "Suivi psychologique, gestion du stress des examens et coaching personnel",
      ],
      schedule: '08h00 - 16h00 (Mardi : 12h00)',
    },
  };

  const faqs = [
    {
      q: "Quelles sont les démarches pour inscrire mon enfant au Groupe Scolaire IQRAA ?",
      a: "La pré-inscription s'effectue directement en ligne via ce site officiel ou sur place à Belgaïd. Après étude de votre dossier et un entretien pédagogique convivial d'évaluation de niveau, la direction vous confirme la place disponible sous 48 heures.",
    },
    {
      q: "Comment fonctionne le transport scolaire et quelles zones sont couvertes ?",
      a: "Notre flotte de bus récents et climatisés dessert Belgaïd, Bir El Djir, la Coopérative Panorama, Millenium, Akid Lotfi, Canastel et les environs. Chaque bus est conduit par un chauffeur professionnel et accompagné d'une assistante pour veiller à la sécurité et à la ponctualité.",
    },
    {
      q: "La restauration scolaire est-elle obligatoire et comment sont préparés les repas ?",
      a: "La cantine est optionnelle mais fortement recommandée. Les déjeuners sont cuisinés quotidiennement sur place avec des ingrédients frais selon les normes strictes d'hygiène et un équilibre nutritionnel adapté à la croissance des élèves. Un goûter sain est également servi l'après-midi.",
    },
    {
      q: "Proposez-vous une demi-pension et une aide aux devoirs le soir ?",
      a: "Oui, notre service d'études surveillées permet aux élèves de réaliser leurs devoirs sous la supervision de nos enseignants. Vos enfants rentrent à la maison l'esprit serein avec leur travail scolaire validé.",
    },
    {
      q: "Quel est le nombre d'élèves par classe ?",
      a: "Afin de garantir un enseignement sur-mesure et une discipline exemplaire, nous limitons strictement les effectifs entre 18 et 22 élèves par division.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 border-l-4 border-[#0284C7] animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#0284C7] shrink-0" />
          <span className="text-sm font-medium">{showNotification}</span>
        </div>
      )}

      {/* TOP BAR / INFORMATION STRIP */}
      <div className="bg-[#0F172A] text-slate-300 text-xs py-2 px-4 border-b border-slate-800 hidden sm:block">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1.5 text-slate-300 hover:text-white transition-colors">
              <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Belgaïd, Bir El Djir, Oran (Près TITAN Gym)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Dimanche au Jeudi : 08h00 - 16h30</span>
            </span>
          </div>
          <div className="flex items-center space-x-5">
            <a
              href="tel:0697471773"
              className="flex items-center space-x-1.5 text-sky-400 font-bold hover:text-sky-300 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>0697 47 17 73</span>
            </a>
            <span className="text-slate-600">|</span>
            <a
              href="mailto:cem.iqra@gmail.com"
              className="flex items-center space-x-1.5 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>cem.iqra@gmail.com</span>
            </a>
            <span className="bg-[#0284C7]/20 text-sky-300 px-2 py-0.5 rounded text-[11px] font-semibold">
              Année 2026/2027
            </span>
          </div>
        </div>
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <a href="#accueil" className="flex items-center space-x-3.5 group">
              <div className="relative flex items-center justify-center w-13 h-13 rounded-2xl bg-white p-1 shadow-md border border-slate-100 group-hover:shadow-sky-500/25 transition-all">
                <SchoolLogo size="md" className="w-full h-full" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg sm:text-xl text-[#0F172A] tracking-tight group-hover:text-[#0284C7] transition-colors">
                    GROUPE SCOLAIRE <span className="text-[#0284C7]">IQRAA</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-arabic font-bold text-[#F97316] text-[13px] tracking-normal">
                    مؤسسة التربية والتعليم الخاصة اقرأ
                  </span>
                  <span className="hidden md:inline text-slate-400">• Belgaïd, Oran</span>
                </div>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-7 text-sm font-semibold text-slate-700">
              <a href="#accueil" className="hover:text-[#0284C7] transition-colors py-2">
                Accueil
              </a>
              <a href="#cycles" className="hover:text-[#0284C7] transition-colors py-2">
                Nos Cycles
              </a>
              <a href="#horaires" className="hover:text-[#0284C7] transition-colors py-2 flex items-center space-x-1">
                <span>Horaires</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
              </a>
              <a href="#services" className="hover:text-[#0284C7] transition-colors py-2">
                Services Scolaires
              </a>
              <a href="#simulateur" className="hover:text-[#0284C7] transition-colors py-2 flex items-center space-x-1">
                <span>Tarifs & Simulateur</span>
                <span className="bg-[#F97316]/10 text-[#F97316] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  Interactif
                </span>
              </a>
              <a href="#contact" className="hover:text-[#0284C7] transition-colors py-2">
                Contact & Accès
              </a>
            </nav>

            {/* CTA Button */}
            <div className="hidden sm:flex items-center space-x-3">
              <a
                href="#pre-inscription"
                className="inline-flex items-center space-x-2 bg-[#0284C7] hover:bg-[#0369A1] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-sky-500/20 hover:shadow-sky-500/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Pré-inscription en ligne</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-slate-700 hover:text-sky-600 hover:bg-slate-100 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl">
            <div className="flex flex-col space-y-2 text-base font-medium text-slate-800">
              <a
                href="#accueil"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-slate-100"
              >
                Accueil
              </a>
              <a
                href="#cycles"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Nos 3 Cycles d'Enseignement</span>
                <span className="text-xs bg-sky-100 text-[#0284C7] px-2 py-0.5 rounded-full font-bold">
                  Primaire • CEM • Lycée
                </span>
              </a>
              <a
                href="#horaires"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Emploi du Temps Officiel</span>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  Entrée 08h00
                </span>
              </a>
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-slate-100"
              >
                Services Scolaires (Transport & Restauration)
              </a>
              <a
                href="#simulateur"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Simulateur Interactif de Frais</span>
                <span className="text-xs bg-orange-100 text-[#F97316] px-2 py-0.5 rounded-full font-bold">
                  Calcul en direct
                </span>
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-slate-100"
              >
                Contact & Plan d'accès
              </a>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
              <a
                href="#pre-inscription"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-[#0284C7] hover:bg-[#0369A1] text-white py-3 rounded-xl font-bold shadow-md shadow-sky-500/20"
              >
                Pré-inscription en ligne 2026/2027
              </a>
              <a
                href="tel:0697471773"
                className="w-full text-center flex items-center justify-center space-x-2 border border-slate-300 text-slate-700 py-2.5 rounded-xl font-semibold"
              >
                <Phone className="w-4 h-4 text-[#0284C7]" />
                <span>Appeler : 0697 47 17 73</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section id="accueil" className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-white via-sky-50/40 to-[#F8FAFC]">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden opacity-60">
          <div className="absolute -top-24 -left-20 w-96 h-96 bg-[#0284C7]/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-20 w-80 h-80 bg-[#F97316]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-[#DC2626]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Institution Badge */}
              <div className="inline-flex items-center space-x-2.5 bg-sky-100/80 border border-sky-200/80 text-[#0284C7] px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-xs">
                <Sparkles className="w-4 h-4 text-[#0284C7]" />
                <span>Inscriptions Ouvertes 2026 / 2027 • Belgaïd, Oran</span>
                <span className="hidden sm:inline font-arabic text-amber-700 font-bold">| تم فتح التسجيلات</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-[1.18]">
                L'Excellence Éducative au <span className="text-[#0284C7]">Cœur</span> de Chaque Étape
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-lg text-[#334155] leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Accompagner vos enfants du <strong className="text-orange-600 font-semibold">Primaire</strong> jusqu'au{' '}
                <strong className="text-red-600 font-semibold">Baccalauréat</strong> à Oran dans un environnement moderne,
                sécurisé et profondément bienveillant fondé sur la rigueur et l'épanouissement.
              </p>

              {/* Arabic Motto */}
              <div className="bg-white/80 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-4 max-w-xl mx-auto lg:mx-0 shadow-xs flex items-center justify-between">
                <div className="text-right w-full font-arabic text-slate-800 text-sm sm:text-base font-bold flex items-center justify-end space-x-2">
                  <span className="text-[#F97316]">«</span>
                  <span>نربي الأجيال بالعلم والقيم نحو مستقبل واعد ومتميز</span>
                  <span className="text-[#0284C7]">»</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#cycles"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white px-7 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-sky-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <School className="w-5 h-5" />
                  <span>Découvrir nos 3 Cycles</span>
                </a>
                <a
                  href="#contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 border-2 border-slate-300 hover:border-[#0284C7] bg-white text-slate-800 hover:text-[#0284C7] px-7 py-3.5 rounded-xl font-bold text-base shadow-xs transition-all hover:bg-sky-50/50"
                >
                  <Phone className="w-4 h-4" />
                  <span>Nous Contacter</span>
                </a>
              </div>

              {/* Trust Badge Strip */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                  <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-[#F97316] shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">3 Cycles Complets</div>
                    <div className="text-[11px] text-slate-500">Primaire • CEM • Lycée</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                  <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center text-[#0284C7] shrink-0">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">Transport & Cantine</div>
                    <div className="text-[11px] text-slate-500">Oran & Belgaïd couverts</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">Cadre Sécurisé</div>
                    <div className="text-[11px] text-slate-500">Surveillance continue</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Card Column */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative glow backing */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0284C7] via-[#F97316] to-[#DC2626] rounded-3xl blur-xl opacity-20 transform -rotate-2" />

                {/* Main Showcase Card */}
                <div className="relative bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
                  {/* Top card header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold tracking-wider uppercase text-sky-700 bg-sky-100 px-2.5 py-1 rounded-md">
                        Établissement Privé Homologué
                      </span>
                      <h3 className="text-xl font-black text-[#0F172A] mt-2">
                        Groupe Scolaire Privé IQRAA
                      </h3>
                      <p className="font-arabic text-amber-700 text-sm font-bold mt-0.5">
                        مؤسسة التربية والتعليم الخاصة اقرأ
                      </p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 p-1.5 flex items-center justify-center shadow-lg">
                      <SchoolLogo size="lg" className="w-full h-full" />
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-3.5 pt-2">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div className="text-2xl font-black text-[#0284C7]">100%</div>
                      <div className="text-xs font-bold text-slate-800">Taux B.E.M & BAC</div>
                      <div className="text-[10px] text-slate-500">Mentions d'excellence</div>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div className="text-2xl font-black text-[#F97316]">18-20</div>
                      <div className="text-xs font-bold text-slate-800">Élèves par classe</div>
                      <div className="text-[10px] text-slate-500">Suivi individualisé</div>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div className="text-2xl font-black text-[#DC2626]">3</div>
                      <div className="text-xs font-bold text-slate-800">Cycles d'Enseignement</div>
                      <div className="text-[10px] text-slate-500">Continuité pédagogique</div>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div className="text-2xl font-black text-emerald-600">5j/7</div>
                      <div className="text-xs font-bold text-slate-800">Demi-pension & Étude</div>
                      <div className="text-[10px] text-slate-500">Accompagnement devoirs</div>
                    </div>
                  </div>

                  {/* Quick Feature Pill */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-orange-50 border border-slate-200/70 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#0284C7] shrink-0">
                      <Award className="w-5 h-5 text-[#0284C7]" />
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-slate-900">Belgaïd, Bir El Djir (Oran)</p>
                      <p className="text-slate-600">À deux pas de TITAN Gym et Coopérative Panorama</p>
                    </div>
                  </div>

                  {/* Direct Action */}
                  <a
                    href="#simulateur"
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all text-center"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Estimer vos frais avec le Simulateur</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: LES 3 CYCLES D'ENSEIGNEMENT */}
      <section id="cycles" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center space-x-2 bg-slate-100 text-slate-800 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span>Parcours Pédagogique Complet</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Nos 3 Cycles d'Enseignement
            </h2>
            <p className="text-base text-slate-600">
              Chaque étape de la scolarité bénéficie d'un encadrement dédié, d'enseignants qualifiés et d'une pédagogie
              active adaptée aux défis de chaque âge.
            </p>
          </div>

          {/* Interactive Cycle Selector Tabs */}
          <div className="flex justify-center mt-10">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 max-w-xl w-full justify-between">
              <button
                onClick={() => setActiveCycleTab('primaire')}
                className={`flex-1 py-3 px-3 sm:px-5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
                  activeCycleTab === 'primaire'
                    ? 'bg-[#F97316] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Primaire</span>
              </button>
              <button
                onClick={() => setActiveCycleTab('moyen')}
                className={`flex-1 py-3 px-3 sm:px-5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
                  activeCycleTab === 'moyen'
                    ? 'bg-[#0284C7] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <School className="w-4 h-4" />
                <span>Moyen (C.E.M)</span>
              </button>
              <button
                onClick={() => setActiveCycleTab('secondaire')}
                className={`flex-1 py-3 px-3 sm:px-5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
                  activeCycleTab === 'secondaire'
                    ? 'bg-[#DC2626] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Lycée (BAC)</span>
              </button>
            </div>
          </div>

          {/* Active Cycle Showcase Detail */}
          <div className="mt-8">
            {Object.entries(cycleDetails).map(([key, cycle]) => {
              if (key !== activeCycleTab) return null;
              return (
                <div
                  key={key}
                  className={`rounded-3xl p-6 sm:p-10 border-2 transition-all ${cycle.bgLight} ${cycle.borderLight} shadow-sm`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-7 space-y-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-3 py-1 rounded-lg text-xs font-extrabold ${cycle.badgeColor}`}>
                          {cycle.grades}
                        </span>
                        <span className="bg-white/80 text-slate-700 px-3 py-1 rounded-lg text-xs font-semibold border border-slate-200">
                          Âge : {cycle.ageRange}
                        </span>
                        <span className="font-arabic font-bold text-sm text-slate-700">
                          {cycle.arabic}
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
                        {cycle.title} : <span style={{ color: cycle.color }}>{cycle.subtitle}</span>
                      </h3>

                      <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                        {cycle.description}
                      </p>

                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                          Points Clés & Atouts Pédagogiques :
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {cycle.highlights.map((item, idx) => (
                            <div key={idx} className="flex items-start space-x-2 bg-white/90 p-2.5 rounded-xl border border-slate-200/60 text-xs sm:text-sm font-medium text-slate-800">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: cycle.color }} />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 flex flex-wrap items-center gap-4">
                        <button
                          onClick={() => {
                            setSimCycle(key as CycleType);
                            const simEl = document.getElementById('simulateur');
                            if (simEl) simEl.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-white text-sm shadow-md transition-all hover:opacity-95"
                          style={{ backgroundColor: cycle.color }}
                        >
                          <Calculator className="w-4 h-4" />
                          <span>Simuler les frais pour ce cycle</span>
                        </button>
                        <a
                          href="#pre-inscription"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, cycle: key as CycleType }));
                          }}
                          className="inline-flex items-center space-x-1.5 text-sm font-bold text-slate-800 hover:text-[#0284C7] bg-white px-5 py-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                        >
                          <span>Pré-inscrire mon enfant</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    {/* Right summary info box */}
                    <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
                      <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                          style={{ backgroundColor: cycle.color }}
                        >
                          {key === 'primaire' && <BookOpen className="w-6 h-6" />}
                          {key === 'moyen' && <School className="w-6 h-6" />}
                          {key === 'secondaire' && <GraduationCap className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="font-extrabold text-[#0F172A]">{cycle.title}</div>
                          <div className="text-xs text-slate-500">{cycle.arabic}</div>
                        </div>
                      </div>

                      <div className="space-y-3 text-xs sm:text-sm">
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">Horaires d'étude :</span>
                          <span className="font-semibold text-slate-900">{cycle.schedule}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">Capacité de classe :</span>
                          <span className="font-semibold text-slate-900">18 à 22 élèves max</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">Langues enseignées :</span>
                          <span className="font-semibold text-slate-900">Arabe • Français • Anglais</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">Transport & Cantine :</span>
                          <span className="font-semibold text-emerald-600">Disponibles sur option</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-slate-500">Localisation :</span>
                          <span className="font-semibold text-slate-900">Belgaïd, Bir El Djir</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                        💡 Les inscriptions se font dans la limite des places disponibles afin de préserver la qualité pédagogique.
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Color-Coded 3 Cards Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {/* Primaire */}
            <div className="bg-white rounded-2xl p-6 border-t-4 border-[#F97316] border-x border-b border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#F97316] flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md">
                    1 AP à 5 AP
                  </span>
                </div>
                <h4 className="text-lg font-bold text-[#0F172A]">Cycle Primaire</h4>
                <p className="text-xs font-arabic text-orange-600 font-bold mb-2">الطور الابتدائي</p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Apprentissages fondamentaux, lecture fluide, calcul mental, éveil artistique et langues vivantes dès le plus jeune âge.
                </p>
                <div className="text-[11px] font-bold text-orange-800 bg-orange-50 px-3 py-1.5 rounded-lg mb-3 border border-orange-200/60">
                  🕒 08h00 - 15h45 (Mardi : 12h15)
                </div>
              </div>
              <button
                onClick={() => setActiveCycleTab('primaire')}
                className="text-xs font-bold text-[#F97316] hover:text-orange-700 flex items-center space-x-1 pt-2 border-t border-slate-100"
              >
                <span>Consulter les détails du Primaire</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Moyen */}
            <div className="bg-white rounded-2xl p-6 border-t-4 border-[#0284C7] border-x border-b border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#0284C7] flex items-center justify-center">
                    <School className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase bg-sky-100 text-sky-700 px-2.5 py-1 rounded-md">
                    1 AM à 4 AM
                  </span>
                </div>
                <h4 className="text-lg font-bold text-[#0F172A]">Cycle Moyen / C.E.M</h4>
                <p className="text-xs font-arabic text-sky-600 font-bold mb-2">طور التعليم المتوسط</p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Méthodologie d'apprentissage, devoirs surveillés réguliers et préparation rigoureuse à l'examen officiel du B.E.M.
                </p>
                <div className="text-[11px] font-bold text-sky-800 bg-sky-50 px-3 py-1.5 rounded-lg mb-3 border border-sky-200/60">
                  🕒 08h00 - 15h45 (Mardi : 12h15)
                </div>
              </div>
              <button
                onClick={() => setActiveCycleTab('moyen')}
                className="text-xs font-bold text-[#0284C7] hover:text-sky-700 flex items-center space-x-1 pt-2 border-t border-slate-100"
              >
                <span>Consulter les détails du C.E.M</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Lycée */}
            <div className="bg-white rounded-2xl p-6 border-t-4 border-[#DC2626] border-x border-b border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-[#DC2626] flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase bg-red-100 text-red-700 px-2.5 py-1 rounded-md">
                    1 AS à 3 AS (BAC)
                  </span>
                </div>
                <h4 className="text-lg font-bold text-[#0F172A]">Cycle Secondaire / Lycée</h4>
                <p className="text-xs font-arabic text-red-600 font-bold mb-2">الطور الثانوي والباكالوريا</p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Excellence académique pour le Baccalauréat, coaching méthodologique, orientation universitaire et préparation aux grandes écoles.
                </p>
                <div className="text-[11px] font-bold text-red-800 bg-red-50 px-3 py-1.5 rounded-lg mb-3 border border-red-200/60">
                  🕒 08h00 - 16h00 (Mardi : 12h00)
                </div>
              </div>
              <button
                onClick={() => setActiveCycleTab('secondaire')}
                className="text-xs font-bold text-[#DC2626] hover:text-red-700 flex items-center space-x-1 pt-2 border-t border-slate-100"
              >
                <span>Consulter les détails du Lycée</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: EMPLOI DU TEMPS OFFICIEL (TIMETABLE) */}
      <section id="horaires" className="py-20 bg-gradient-to-b from-white via-sky-50/30 to-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
            <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Organisation & Rythme Scolaire</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Emploi du Temps Officiel
            </h2>
            <p className="font-arabic text-[#0284C7] font-bold text-base">
              مواقيت الدخول والخروج الرسمية لجميع الأطوار التعليمية
            </p>
            <p className="text-base text-slate-600">
              Une organisation rigoureuse pensée pour le bien-être et la concentration optimale de nos élèves, avec
              une entrée commune à 08h00 pour tous les cycles.
            </p>
          </div>

          {/* General Entry Announcement Strip */}
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white p-5 rounded-2xl shadow-lg mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-sky-200">
                  Règle d'or de ponctualité
                </div>
                <div className="text-lg font-black text-white">
                  Entrée Générale à 08h00 pour tous les cycles
                </div>
              </div>
            </div>
            <span className="bg-white/20 backdrop-blur-xs px-3.5 py-1.5 rounded-xl text-xs font-bold text-white border border-white/30">
              Ouverture des portes dès 07h30
            </span>
          </div>

          {/* Visual Timetable Cards (Regular vs Tuesday) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Regular Days Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200/90 shadow-md hover:shadow-xl transition-all relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0284C7] bg-sky-100 px-3 py-1 rounded-md">
                    4 Jours par Semaine
                  </span>
                  <h3 className="text-xl font-black text-[#0F172A] mt-2">
                    Jours Réguliers
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    Dimanche • Lundi • Mercredi • Jeudi
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#0284C7] flex items-center justify-center font-bold">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-4">
                {/* Primaire */}
                <div className="bg-orange-50/70 rounded-2xl p-4 border border-orange-200/70 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-[#F97316]" />
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">Cycle Primaire</div>
                      <div className="text-xs text-slate-500">1ère à 5ème Année (AP)</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-orange-950">08h00 ➔ 15h45</div>
                    <div className="text-[11px] font-bold text-orange-700">Sortie : 15h45</div>
                  </div>
                </div>

                {/* Moyen */}
                <div className="bg-sky-50/70 rounded-2xl p-4 border border-sky-200/70 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-[#0284C7]" />
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">Cycle Moyen (C.E.M)</div>
                      <div className="text-xs text-slate-500">1ère à 4ème Année (AM)</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-sky-950">08h00 ➔ 15h45</div>
                    <div className="text-[11px] font-bold text-sky-700">Sortie : 15h45</div>
                  </div>
                </div>

                {/* Secondaire */}
                <div className="bg-red-50/70 rounded-2xl p-4 border border-red-200/70 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-[#DC2626]" />
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">Cycle Secondaire / Lycée</div>
                      <div className="text-xs text-slate-500">1ère à 3ème Année (BAC)</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-red-950">08h00 ➔ 16h00</div>
                    <div className="text-[11px] font-bold text-red-700">Sortie : 16h00</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>🍽️ Pause déjeuner & cantine incluses</span>
                <span className="font-bold text-[#0284C7]">Journée continue</span>
              </div>
            </div>

            {/* Special Tuesday Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-md hover:shadow-xl transition-all relative overflow-hidden bg-gradient-to-b from-amber-50/40 via-white to-white">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-md">
                    Horaire Spécial Allégé
                  </span>
                  <h3 className="text-xl font-black text-[#0F172A] mt-2">
                    Mardi (Sortie Anticipée)
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    Après-midi libre pour révision & activités
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-4">
                {/* Lycée Mardi (exits early at 12:00) */}
                <div className="bg-red-50/90 rounded-2xl p-4 border border-red-300 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-[#DC2626]" />
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">Cycle Secondaire / Lycée</div>
                      <div className="text-xs text-slate-500">Terminale & Classes secondaires</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-red-950">08h00 ➔ 12h00</div>
                    <span className="inline-block bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md mt-0.5">
                      Sortie : 12h00
                    </span>
                  </div>
                </div>

                {/* Primaire & Moyen Mardi (exit at 12:15) */}
                <div className="bg-sky-50/90 rounded-2xl p-4 border border-sky-300 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-[#0284C7]" />
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">Cycle Primaire & Moyen</div>
                      <div className="text-xs text-slate-500">1 AP à 5 AP et 1 AM à 4 AM</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-sky-950">08h00 ➔ 12h15</div>
                    <span className="inline-block bg-[#0284C7] text-white text-[10px] font-black px-2 py-0.5 rounded-md mt-0.5">
                      Sortie : 12h15
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Précision Transport le Mardi :</span>
                  </div>
                  <p>
                    Le transport scolaire assure le retour de tous les élèves inscrits dès leur heure respective de sortie (12h00 pour le lycée, 12h15 pour le primaire/moyen).
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>⚡ Rythme pédagogique national respecté</span>
                <span className="font-bold text-amber-700">Matinée intense</span>
              </div>
            </div>
          </div>

          {/* Quick Schedule Summary Table */}
          <div className="mt-12 max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                Tableau Synthétique des Horaires Hebdomadaires
              </span>
              <span className="text-xs text-slate-500 font-arabic font-bold">جدول المواقيت الأسبوعية</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Cycle d'Enseignement</th>
                    <th className="p-3.5">Entrée Quotidienne</th>
                    <th className="p-3.5">Dimanche, Lundi, Mercredi, Jeudi</th>
                    <th className="p-3.5 text-amber-900 bg-amber-50/80">Mardi (Sortie Anticipée)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3.5 font-bold text-orange-700 flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                      <span>Primaire (1 AP - 5 AP)</span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">08h00</td>
                    <td className="p-3.5 font-extrabold text-slate-900">15h45</td>
                    <td className="p-3.5 font-extrabold text-amber-950 bg-amber-50/40">12h15</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-sky-700 flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
                      <span>Moyen / C.E.M (1 AM - 4 AM)</span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">08h00</td>
                    <td className="p-3.5 font-extrabold text-slate-900">15h45</td>
                    <td className="p-3.5 font-extrabold text-amber-950 bg-amber-50/40">12h15</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-red-700 flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
                      <span>Secondaire / Lycée (1 AS - 3 AS)</span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">08h00</td>
                    <td className="p-3.5 font-extrabold text-slate-900">16h00</td>
                    <td className="p-3.5 font-extrabold text-amber-950 bg-amber-50/40">12h00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: VIE SCOLAIRE & SERVICES (THE 3 KEY PILLARS) */}
      <section id="services" className="py-20 bg-[#F8FAFC] border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center space-x-2 bg-sky-100 text-[#0284C7] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span>Sérénité & Confort des Familles</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Vie Scolaire & Services Premium
            </h2>
            <p className="text-base text-slate-600">
              Pour que les parents travaillent en toute tranquillité et que les élèves étudient dans les meilleures
              conditions, IQRAA propose une logistique complète et soignée.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-14">
            {/* Pillar 1: Transport Scolaire */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white flex items-center justify-center shadow-lg mb-6 group-hover:scale-105 transition-transform">
                <Bus className="w-7 h-7" />
              </div>
              <div className="space-y-3">
                <span className="text-xs font-extrabold text-sky-600 uppercase tracking-wider">
                  Pilier 1 • Sécurité Routière
                </span>
                <h3 className="text-xl font-black text-[#0F172A]">
                  Transport Scolaire Sécurisé
                </h3>
                <p className="text-xs font-arabic text-slate-500 font-bold">
                  نقل مدرسي مريح وآمن يشمل أحياء وهران
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Une flotte moderne de minibus climatisés et contrôlés régulièrement, assurant le ramassage scolaire
                  matin, midi et soir avec ponctualité exemplaire.
                </p>

                {/* Specific Surrounding Areas Notice */}
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-200/80 text-xs text-sky-950 font-medium">
                  📢 <strong>Note Transport :</strong> Le transport scolaire est disponible pour les <strong>zones avoisinantes</strong> (Belgaïd, Bir El Djir et environs) sur simple demande formulée auprès de l'administration.
                </div>

                <ul className="space-y-2 pt-1 text-xs text-slate-700">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0284C7] shrink-0" />
                    <span>Dessertes sur-mesure pour les zones avoisinantes de Belgaïd & Bir El Djir</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0284C7] shrink-0" />
                    <span>Chauffeurs professionnels chevronnés et prudents</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0284C7] shrink-0" />
                    <span>Accompagnatrices dédiées pour la montée et descente des enfants</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pillar 2: Restauration Scolaire */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F97316] to-orange-600 text-white flex items-center justify-center shadow-lg mb-6 group-hover:scale-105 transition-transform">
                <Utensils className="w-7 h-7" />
              </div>
              <div className="space-y-3">
                <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">
                  Pilier 2 • Nutrition & Hygiène
                </span>
                <h3 className="text-xl font-black text-[#0F172A]">
                  Restauration Scolaire & Goûter
                </h3>
                <p className="text-xs font-arabic text-slate-500 font-bold">
                  إطعام مدرسي صحي ومتوازن تحت رقابة صارمة
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Des repas chauds, équilibrés et savoureux préparés chaque jour dans notre cuisine aux normes
                  d'hygiène rigoureuses, complétés par un goûter sain l'après-midi.
                </p>

                <ul className="space-y-2 pt-3 text-xs text-slate-700">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#F97316] shrink-0" />
                    <span>Menus diététiques adaptés aux besoins des élèves en pleine croissance</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#F97316] shrink-0" />
                    <span>Ingrédients frais de saison sélectionnés avec soin</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#F97316] shrink-0" />
                    <span>Surveillance attentive lors des repas et apprentissage de l'autonomie</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pillar 3: Études Surveillées & Demi-pension */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#DC2626] to-red-700 text-white flex items-center justify-center shadow-lg mb-6 group-hover:scale-105 transition-transform">
                <Clock className="w-7 h-7" />
              </div>
              <div className="space-y-3">
                <span className="text-xs font-extrabold text-red-600 uppercase tracking-wider">
                  Pilier 3 • Réussite Sans Stress
                </span>
                <h3 className="text-xl font-black text-[#0F172A]">
                  Études Surveillées & Demi-pension
                </h3>
                <p className="text-xs font-arabic text-slate-500 font-bold">
                  نصف إقامة ومتابعة يومية للواجبات المدرسية
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Les devoirs sont accomplis sous le regard attentif de professeurs qui éclairent les notions difficiles.
                  Les enfants rentrent à la maison libérés et sereins.
                </p>

                <ul className="space-y-2 pt-3 text-xs text-slate-700">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>Soutien scolaire quotidien et méthodologie de travail personnel</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>Correction immédiate des exercices et révision des cours</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>Ateliers du soir : Club robotique, échecs et lecture silencieuse</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: SIMULATEUR INTERACTIF DE PRÉ-INSCRIPTION */}
      <section id="simulateur" className="py-20 bg-gradient-to-b from-white via-sky-50/50 to-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center space-x-2 bg-sky-100 text-[#0284C7] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5" />
              <span>Outil d'Aide aux Familles</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Simulateur Interactif de Pré-inscription
            </h2>
            <p className="text-base text-slate-600">
              Configurez le cycle de votre enfant et sélectionnez les services scolaires souhaités pour obtenir une
              estimation instantanée et transparente.
            </p>
          </div>

          <div className="mt-12 max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Configuration Panel */}
              <div className="lg:col-span-7 p-6 sm:p-10 space-y-8">
                {/* Step 1: Cycle selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-extrabold text-[#0F172A] flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-xs">
                        1
                      </span>
                      <span>Choisissez le Cycle Scolaire :</span>
                    </label>
                    <span className="text-xs text-slate-400 font-medium">Obligatoire</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSimCycle('primaire');
                        setSimGrade('1ap');
                      }}
                      className={`p-3 rounded-2xl border-2 text-center transition-all ${
                        simCycle === 'primaire'
                          ? 'border-[#F97316] bg-orange-50/70 text-orange-950 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <BookOpen className="w-5 h-5 mx-auto mb-1 text-[#F97316]" />
                      <div className="text-xs font-bold">Primaire</div>
                      <div className="text-[10px] text-slate-500">1 AP - 5 AP</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSimCycle('moyen');
                        setSimGrade('4am');
                      }}
                      className={`p-3 rounded-2xl border-2 text-center transition-all ${
                        simCycle === 'moyen'
                          ? 'border-[#0284C7] bg-sky-50/70 text-sky-950 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <School className="w-5 h-5 mx-auto mb-1 text-[#0284C7]" />
                      <div className="text-xs font-bold">Moyen (CEM)</div>
                      <div className="text-[10px] text-slate-500">1 AM - 4 AM</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSimCycle('secondaire');
                        setSimGrade('3as');
                      }}
                      className={`p-3 rounded-2xl border-2 text-center transition-all ${
                        simCycle === 'secondaire'
                          ? 'border-[#DC2626] bg-red-50/70 text-red-950 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <GraduationCap className="w-5 h-5 mx-auto mb-1 text-[#DC2626]" />
                      <div className="text-xs font-bold">Lycée (BAC)</div>
                      <div className="text-[10px] text-slate-500">1 AS - 3 AS</div>
                    </button>
                  </div>
                </div>

                {/* Step 2: Grade level select */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span>Niveau / Classe visée :</span>
                  </label>
                  <select
                    value={simGrade}
                    onChange={e => setSimGrade(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0284C7]"
                  >
                    {getGradeOptions(simCycle).map(g => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Step 3: Optional Services & Add-ons */}
                <div className="space-y-4 pt-2">
                  <label className="text-sm font-extrabold text-[#0F172A] flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-xs">
                      3
                    </span>
                    <span>Options & Services Scolaires Complémentaires :</span>
                  </label>

                  {/* Option: Transport */}
                  <div className={`p-4 rounded-2xl border transition-all ${simTransport ? 'bg-sky-50/60 border-sky-300' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="chk-transport"
                          checked={simTransport}
                          onChange={e => setSimTransport(e.target.checked)}
                          className="w-5 h-5 text-[#0284C7] rounded-md focus:ring-[#0284C7] cursor-pointer"
                        />
                        <label htmlFor="chk-transport" className="cursor-pointer">
                          <div className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                            <Bus className="w-4 h-4 text-[#0284C7]" />
                            <span>Transport Scolaire Quotidien</span>
                          </div>
                          <div className="text-xs text-slate-500">Aller-retour sécurisé avec accompagnatrice</div>
                        </label>
                      </div>
                      <span className="text-xs font-bold text-sky-700">Dès 5 000 DA/mois</span>
                    </div>

                    {simTransport && (
                      <div className="mt-3 pl-8">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Zone de ramassage à Oran :
                        </label>
                        <select
                          value={simTransportZone}
                          onChange={e => setSimTransportZone(e.target.value)}
                          className="w-full bg-white border border-sky-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                        >
                          <option value="belgaid">Secteur Belgaïd / Coop Panorama (5 000 DA/mois)</option>
                          <option value="bir_el_djir">Bir El Djir & Millenium (6 500 DA/mois)</option>
                          <option value="grand_oran">Akid Lotfi / Canastel / Grand Oran (8 000 DA/mois)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Option: Restauration */}
                  <div className={`p-4 rounded-2xl border transition-all ${simCanteen ? 'bg-orange-50/60 border-orange-300' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="chk-canteen"
                          checked={simCanteen}
                          onChange={e => setSimCanteen(e.target.checked)}
                          className="w-5 h-5 text-[#F97316] rounded-md focus:ring-[#F97316] cursor-pointer"
                        />
                        <label htmlFor="chk-canteen" className="cursor-pointer">
                          <div className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                            <Utensils className="w-4 h-4 text-[#F97316]" />
                            <span>Restauration Scolaire (Déjeuner & Goûter)</span>
                          </div>
                          <div className="text-xs text-slate-500">Cuisiné sur place, équilibré et frais</div>
                        </label>
                      </div>
                      <span className="text-xs font-bold text-orange-700">7 000 DA/mois</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Summary & Calculation Card */}
              <div className="lg:col-span-5 bg-gradient-to-br from-[#0F172A] to-slate-900 text-white p-6 sm:p-10 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-sky-400">
                        Devis Prévisionnel
                      </div>
                      <h3 className="text-xl font-black text-white">
                        Récapitulatif Estimatif
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400">
                      <Calculator className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Selected Package Breakdown */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center text-slate-300 pb-2 border-b border-slate-800/80">
                      <div>
                        <div className="font-semibold text-white">
                          Frais Pédagogiques ({simCycle.toUpperCase()})
                        </div>
                        <div className="text-xs text-slate-400">Enseignement, manuels & fournitures</div>
                      </div>
                      <span className="font-bold text-white">{fees.baseTuition.toLocaleString('fr-FR')} DA</span>
                    </div>

                    {simTransport && (
                      <div className="flex justify-between items-center text-slate-300 pb-2 border-b border-slate-800/80">
                        <div>
                          <div className="font-semibold text-white">Transport Scolaire</div>
                          <div className="text-xs text-slate-400">Zone : {simTransportZone}</div>
                        </div>
                        <span className="font-bold text-sky-400">+{fees.transportCost.toLocaleString('fr-FR')} DA</span>
                      </div>
                    )}

                    {simCanteen && (
                      <div className="flex justify-between items-center text-slate-300 pb-2 border-b border-slate-800/80">
                        <div>
                          <div className="font-semibold text-white">Cantine & Goûter</div>
                          <div className="text-xs text-slate-400">Repas complets cuisinés sur place</div>
                        </div>
                        <span className="font-bold text-orange-400">+{fees.canteenCost.toLocaleString('fr-FR')} DA</span>
                      </div>
                    )}
                  </div>

                  {/* Total Display */}
                  <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-400 font-semibold uppercase">Total Mensuel Estimé :</span>
                      <div className="text-right">
                        <span className="text-3xl font-black text-sky-400">
                          {fees.monthlyTotal.toLocaleString('fr-FR')}
                        </span>
                        <span className="text-xs font-bold text-slate-400 ml-1">DA / mois</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-700/60 text-xs">
                      <span className="text-slate-400">Équivalent Trimestriel :</span>
                      <span className="font-extrabold text-slate-200">
                        {fees.trimestrialTotal.toLocaleString('fr-FR')} DA
                      </span>
                    </div>
                  </div>

                  {/* Pricing Disclaimer & Guidance */}
                  <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
                    <div className="font-bold text-sky-300 flex items-center space-x-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Tarification sur-mesure par cycle & options :</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Nos tarifs sont adaptés en fonction du cycle de l’enfant (Primaire, Moyen, Lycée) et des services choisis (transport pour zones avoisinantes / restauration). <strong>Les devis exacts et la grille officielle vous sont remis lors de votre visite à l’école.</strong>
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-tight">
                    * Tarifs indicatifs en Dinar Algérien (DZD) pour l'année scolaire 2026/2027. Tarifs dégressifs pour les
                    fratries (réduction de 10% sur le 2ème enfant et 15% sur le 3ème).
                  </p>
                </div>

                {/* Trigger validation button */}
                <div className="pt-6">
                  <button
                    type="button"
                    onClick={applySimulatorToForm}
                    className="w-full flex items-center justify-center space-x-2 bg-[#0284C7] hover:bg-[#0369A1] text-white py-4 rounded-xl font-bold text-sm shadow-xl shadow-sky-500/25 transition-all transform hover:-translate-y-0.5"
                  >
                    <span>Valider ma demande & Pré-inscrire</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-[11px] text-slate-400 mt-2">
                    Transfère vos choix directement dans le formulaire ci-dessous.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: FORMULAIRE DE PRÉ-INSCRIPTION & CONTACT */}
      <section id="pre-inscription" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Form Guidelines & Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-sky-100 text-[#0284C7] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                <span>Dossier Rapide</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                Pré-inscription en Ligne
              </h2>

              <p className="font-arabic text-[#F97316] font-bold text-base">
                استمارة التسجيل الأولي للسنة الدراسية 2026/2027
              </p>

              <p className="text-slate-600 text-sm leading-relaxed">
                Remplissez ce formulaire officiel pour réserver une place pour votre enfant. Notre équipe administrative
                prendra contact avec vous sous 24 à 48 heures pour organiser la visite de l'établissement et l'entretien
                d'admission.
              </p>

              {/* Steps timeline card */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Les étapes après soumission :
                </h4>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-sky-100 text-[#0284C7] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Confirmation téléphonique</div>
                      <div className="text-[11px] text-slate-500">Appel de notre secrétariat pour convenir d'un rendez-vous</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-[#F97316] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Visite & Entretien convivial</div>
                      <div className="text-[11px] text-slate-500">Découverte des locaux à Belgaïd et test de niveau de l'enfant</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Validation & Inscription définitive</div>
                      <div className="text-[11px] text-slate-500">Dépôt du dossier administratif et attribution de la classe</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency / Direct contact card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#0284C7] text-white flex items-center justify-center shrink-0 shadow-md">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-600 font-medium">Une question urgente ? Appelez notre direction :</div>
                  <a
                    href="tel:0697471773"
                    className="text-lg font-black text-[#0284C7] hover:underline"
                  >
                    0697 47 17 73
                  </a>
                  <div className="text-[11px] text-slate-500">Dimanche - Jeudi (08h00 - 16h30)</div>
                </div>
              </div>
            </div>

            {/* Right Column: Pre-registration Interactive Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Parent Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center space-x-2">
                    <Users className="w-4 h-4 text-[#0284C7]" />
                    <span>Informations du Parent / Tuteur</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nom & Prénom du Parent <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Mohamed Benali"
                        value={formData.parentFullName}
                        onChange={e => setFormData({ ...formData, parentFullName: e.target.value })}
                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0284C7] ${
                          formErrors.parentFullName ? 'border-red-500' : 'border-slate-300'
                        }`}
                      />
                      {formErrors.parentFullName && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.parentFullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Numéro de Téléphone (Algérie) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="0697 47 17 73 ou 05/06/07..."
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0284C7] ${
                          formErrors.phone ? 'border-red-500' : 'border-slate-300'
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Adresse Email
                      </label>
                      <input
                        type="email"
                        placeholder="parent@gmail.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0284C7]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Quartier de Résidence (Oran)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Belgaïd, Bir El Djir, Akid Lotfi..."
                        value={formData.district}
                        onChange={e => setFormData({ ...formData, district: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0284C7]"
                      />
                    </div>
                  </div>
                </div>

                {/* Student Section */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-[#F97316]" />
                    <span>Informations de l'Élève</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nom & Prénom de l'Élève <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Yasmine Benali"
                        value={formData.studentFullName}
                        onChange={e => setFormData({ ...formData, studentFullName: e.target.value })}
                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0284C7] ${
                          formErrors.studentFullName ? 'border-red-500' : 'border-slate-300'
                        }`}
                      />
                      {formErrors.studentFullName && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.studentFullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Date de Naissance
                      </label>
                      <input
                        type="date"
                        value={formData.studentBirthDate}
                        onChange={e => setFormData({ ...formData, studentBirthDate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0284C7]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Cycle Souhaité
                      </label>
                      <select
                        value={formData.cycle}
                        onChange={e => {
                          const newCycle = e.target.value as CycleType;
                          const defaultGrade = getGradeOptions(newCycle)[0]?.label || '';
                          setFormData({ ...formData, cycle: newCycle, gradeLevel: defaultGrade });
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0284C7]"
                      >
                        <option value="primaire">Cycle Primaire (1 AP - 5 AP)</option>
                        <option value="moyen">Cycle Moyen / C.E.M (1 AM - 4 AM)</option>
                        <option value="secondaire">Cycle Secondaire / Lycée (BAC)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Classe / Niveau Précis
                      </label>
                      <select
                        value={formData.gradeLevel}
                        onChange={e => setFormData({ ...formData, gradeLevel: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0284C7]"
                      >
                        {getGradeOptions(formData.cycle).map(g => (
                          <option key={g.value} value={g.label}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Options Selected */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center space-x-2">
                    <Bus className="w-4 h-4 text-emerald-600" />
                    <span>Services Scolaires Souhaités</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`p-3 rounded-xl border flex items-center space-x-2 cursor-pointer transition-colors ${formData.needTransport ? 'bg-sky-50 border-sky-300 text-sky-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                      <input
                        type="checkbox"
                        checked={formData.needTransport}
                        onChange={e => setFormData({ ...formData, needTransport: e.target.checked })}
                        className="w-4 h-4 text-[#0284C7] rounded focus:ring-sky-500"
                      />
                      <span className="text-xs">Transport Scolaire Bus</span>
                    </label>

                    <label className={`p-3 rounded-xl border flex items-center space-x-2 cursor-pointer transition-colors ${formData.needCanteen ? 'bg-orange-50 border-orange-300 text-orange-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                      <input
                        type="checkbox"
                        checked={formData.needCanteen}
                        onChange={e => setFormData({ ...formData, needCanteen: e.target.checked })}
                        className="w-4 h-4 text-[#F97316] rounded focus:ring-orange-500"
                      />
                      <span className="text-xs">Restauration Cantine (Déjeuner & Goûter)</span>
                    </label>
                  </div>
                </div>

                {/* Additional Comments */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Questions, Antécédents Scolaires ou Remarques Particulières
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Établissement précédent, langue vivante étudiée, besoins particuliers..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0284C7]"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white py-4 rounded-xl font-bold text-base shadow-xl shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Send className="w-5 h-5" />
                    <span>Envoyer ma Demande de Pré-inscription</span>
                  </button>
                  <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center space-x-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Vos données restent confidentielles et traitées exclusivement par l'administration IQRAA.</span>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CONFIRMATION MODAL ON SUBMIT */}
      {submittedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 p-2 mx-auto shadow-md flex items-center justify-center">
                <SchoolLogo size="lg" className="w-full h-full" />
              </div>
              <h3 className="text-2xl font-black text-[#0F172A]">
                Demande Enregistrée avec Succès !
              </h3>
              <p className="font-arabic text-[#F97316] font-bold text-sm">
                تم استلام طلب التسجيل الأولي بنجاح
              </p>
              <p className="text-xs sm:text-sm text-slate-600">
                Merci {formData.parentFullName}, votre dossier de pré-inscription pour{' '}
                <strong className="text-slate-900">{formData.studentFullName}</strong> a bien été transmis au secrétariat
                pédagogique d'IQRAA Belgaïd.
              </p>
            </div>

            {/* Reference Badge */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Numéro de Dossier Temporaire
                </div>
                <div className="text-lg font-mono font-black text-[#0284C7]">
                  {submissionReference}
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                Statut : En cours d'étude
              </span>
            </div>

            {/* Summary List */}
            <div className="space-y-2 text-xs bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Cycle & Classe :</span>
                <span className="font-bold text-slate-900">{formData.gradeLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Téléphone de contact :</span>
                <span className="font-bold text-slate-900">{formData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transport Scolaire :</span>
                <span className="font-bold text-slate-900">
                  {formData.needTransport ? 'Oui (Demandé)' : 'Non'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Restauration :</span>
                <span className="font-bold text-slate-900">
                  {formData.needCanteen ? 'Oui (Demandé)' : 'Non'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Notre conseiller pédagogique vous appellera sous 24 à 48h au <strong>{formData.phone}</strong> pour planifier
                votre visite. Munissez-vous des bulletins scolaires précédents lors du rendez-vous.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer le reçu</span>
              </button>
              <button
                type="button"
                onClick={() => setSubmittedModalOpen(false)}
                className="flex-1 bg-[#0284C7] hover:bg-[#0369A1] text-white py-3 rounded-xl font-bold text-xs shadow-md"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: FAQ ACCORDION */}
      <section className="py-16 bg-[#F8FAFC] border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-10">
            <span className="text-xs font-extrabold uppercase text-[#0284C7] tracking-wider bg-sky-100 px-3 py-1 rounded-full">
              Foire Aux Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
              Questions Fréquentes des Parents
            </h2>
            <p className="text-sm text-slate-600">
              Retrouvez ici toutes les réponses concernant les formalités, la vie scolaire et l'accompagnement pédagogique.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-5 text-left font-bold text-slate-900 flex justify-between items-center space-x-4 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm sm:text-base">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-[#0284C7]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 8: CONTACT & ACCÈS (LOCALISATION BELGAÏD, ORAN) */}
      <section id="contact" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
            <div className="inline-flex items-center space-x-2 bg-sky-100 text-[#0284C7] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              <span>Belgaïd • Bir El Djir • Oran</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Nous Contacter & Nous Rendre Visite
            </h2>
            <p className="text-base text-slate-600">
              Notre équipe d'accueil vous reçoit du dimanche au jeudi pour une présentation complète des locaux et du
              projet d'établissement.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Details Cards */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0284C7] text-white flex items-center justify-center shrink-0 shadow-md">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Adresse de l'Établissement</h4>
                    <p className="text-xs text-slate-700 font-semibold mt-1">
                      Belgaïd, Commune de Bir El Djir, Oran, Algérie
                    </p>
                    <p className="text-[11px] text-[#F97316] font-bold mt-1">
                      Repères : Près de la salle TITAN Gym & en face de la Coopérative Panorama
                    </p>
                    <p className="text-[11px] font-arabic text-slate-500 font-bold mt-0.5">
                      بلقايد، بئر الجير، وهران (بالقرب من قاعة تيتان جيم وتعاونية بانوراما)
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 pt-3 border-t border-slate-200">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Téléphone Direct</h4>
                    <a
                      href="tel:0697471773"
                      className="text-base font-black text-emerald-700 hover:underline block mt-0.5"
                    >
                      0697 47 17 73
                    </a>
                    <p className="text-[11px] text-slate-500">Ligne directe secrétariat et pré-inscriptions</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 pt-3 border-t border-slate-200">
                  <div className="w-12 h-12 rounded-xl bg-[#DC2626] text-white flex items-center justify-center shrink-0 shadow-md">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Courrier Électronique</h4>
                    <a
                      href="mailto:cem.iqra@gmail.com"
                      className="text-sm font-bold text-slate-800 hover:text-[#0284C7] block mt-0.5"
                    >
                      cem.iqra@gmail.com
                    </a>
                    <p className="text-[11px] text-slate-500">Réponse sous 24h ouvrées</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 pt-3 border-t border-slate-200">
                  <div className="w-12 h-12 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shrink-0 shadow-md">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Horaires d'Accueil & Administration</h4>
                    <p className="text-xs text-slate-700 mt-1">
                      <strong>Dimanche à Jeudi :</strong> 08h00 - 16h30 en continu
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <strong>Samedi :</strong> Permanence sur rendez-vous téléphonique
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Call Action Card */}
              <div className="bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-sky-200">Besoin d'un renseignement immédiat ?</div>
                  <div className="text-xl font-black">0697 47 17 73</div>
                </div>
                <a
                  href="tel:0697471773"
                  className="bg-white text-[#0284C7] hover:bg-sky-50 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md"
                >
                  Appeler
                </a>
              </div>
            </div>

            {/* Google Maps / Localisation Embed */}
            <div className="lg:col-span-7 bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-md relative h-[480px]">
              {/* Map Iframe for Ecole Privée IQRAA Belgaïd, Oran */}
              <iframe
                title="Localisation Ecole Privée IQRAA Belgaïd Oran"
                src="https://maps.google.com/maps?q=35.7583679,-0.5420885&hl=fr&z=16&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Map Floating Card Badge */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200 max-w-sm text-xs space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-extrabold text-slate-900 text-sm">Ecole Privée IQRAA</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Belgaïd, Bir El Djir • Coordonnées : 35.758368, -0.542089
                </p>
                <p className="text-[11px] text-[#F97316] font-bold">
                  Près TITAN Gym & Coopérative Panorama
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href="https://www.google.com/maps/place/Ecole+Priv%C3%A9e+IQRAA/@35.7583679,-0.5420885,16z/data=!4m6!3m5!1s0xd7e7cbef9885777:0x886347f60f278628!8m2!3d35.7583679!4d-0.5420885!16s%2Fg%2F11c1xp1476"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white px-3 py-1.5 rounded-lg font-bold text-[11px] shadow-xs transition-colors"
                  >
                    <span>Ouvrir dans Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=35.7583679,-0.5420885"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors"
                  >
                    <Navigation className="w-3 h-3 text-[#0284C7]" />
                    <span>Itinéraire</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0F172A] text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
            {/* School Profile */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md border border-slate-700 flex items-center justify-center shrink-0">
                  <SchoolLogo size="md" className="w-full h-full" />
                </div>
                <div>
                  <div className="text-white font-black text-base tracking-tight">
                    GROUPE SCOLAIRE PRIVÉ <span className="text-[#0284C7]">IQRAA</span>
                  </div>
                  <div className="font-arabic font-bold text-[#F97316] text-xs">
                    مؤسسة التربية والتعليم الخاصة اقرأ
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Établissement d'enseignement privé d'excellence à Belgaïd, Bir El Djir (Oran). Cycles Primaire,
                Moyen (C.E.M) et Secondaire (Lycée). Transport sécurisé, restauration soignée et études surveillées.
              </p>
              <div className="pt-2 flex items-center space-x-3 text-slate-300">
                <span className="bg-slate-800 px-3 py-1 rounded-lg text-[11px] font-semibold text-slate-300 border border-slate-700">
                  Oran, Algérie
                </span>
                <span className="bg-sky-950/80 px-3 py-1 rounded-lg text-[11px] font-semibold text-sky-400 border border-sky-800">
                  Agrément Officiel
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-3 space-y-3">
              <div className="text-white font-bold text-sm tracking-wider uppercase">
                Navigation Rapide
              </div>
              <ul className="space-y-2">
                <li>
                  <a href="#accueil" className="hover:text-white transition-colors">
                    Accueil
                  </a>
                </li>
                <li>
                  <a href="#cycles" className="hover:text-white transition-colors">
                    Nos 3 Cycles (Primaire, Moyen, Lycée)
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-white transition-colors">
                    Transport & Restauration
                  </a>
                </li>
                <li>
                  <a href="#simulateur" className="hover:text-white transition-colors">
                    Simulateur Interactif de Frais
                  </a>
                </li>
                <li>
                  <a href="#pre-inscription" className="hover:text-white transition-colors">
                    Formulaire de Pré-inscription
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition-colors">
                    Plan d'accès & Coordonnées
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact & Legal */}
            <div className="lg:col-span-4 space-y-3">
              <div className="text-white font-bold text-sm tracking-wider uppercase">
                Contact & Coordonnées
              </div>
              <ul className="space-y-2.5">
                <li className="flex items-start space-x-2.5">
                  <MapPin className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />
                  <span>Belgaïd, Bir El Djir, Oran (Près TITAN Gym & Coopérative Panorama)</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Phone className="w-4 h-4 text-[#0284C7] shrink-0" />
                  <a href="tel:0697471773" className="hover:text-white font-bold text-sky-400">
                    0697 47 17 73
                  </a>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Mail className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <a href="mailto:cem.iqra@gmail.com" className="hover:text-white">
                    cem.iqra@gmail.com
                  </a>
                </li>
                <li className="flex items-start space-x-2.5">
                  <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Dimanche à Jeudi : 08h00 - 16h30</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center text-slate-500 gap-4 text-[11px]">
            <div>
              Copyright © 2026 Groupe Scolaire Privé IQRAA (مؤسسة التربية والتعليم الخاصة اقرأ). Tous droits réservés.
            </div>
            <div className="flex items-center space-x-4">
              <span>Belgaïd, Oran, Algérie</span>
              <span>•</span>
              <a href="#pre-inscription" className="text-sky-400 hover:underline">
                Pré-inscriptions Ouvertes 2026/2027
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* EMBEDDED INTERACTIVE CHATBOT (No external AI/No API keys) */}
      <ChatbotWidget />
    </div>
  );
}
