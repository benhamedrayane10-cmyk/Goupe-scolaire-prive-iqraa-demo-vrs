import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Clock,
  Bus,
  CreditCard,
  MapPin,
  Send,
  Phone,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  bullets?: string[];
  actionLink?: {
    text: string;
    href: string;
    isExternal?: boolean;
  };
  timestamp: string;
}

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialBotMessage: Message = {
    id: 'welcome-1',
    sender: 'bot',
    text: 'Bonjour et bienvenue au Groupe Scolaire Privé IQRAA ! 👋 Je suis votre assistant virtuel. Comment puis-je vous aider aujourd’hui ?',
    timestamp: 'À l’instant',
  };

  const [messages, setMessages] = useState<Message[]>([initialBotMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleQuickReply = (topic: 'horaires' | 'transport' | 'tarifs' | 'contact') => {
    let userText = '';
    let botResponse: Omit<Message, 'id' | 'timestamp'> = {
      sender: 'bot',
      text: '',
    };

    switch (topic) {
      case 'horaires':
        userText = 'Horaires de cours';
        botResponse = {
          sender: 'bot',
          text: '🕒 Voici les horaires officiels de cours pour l’ensemble des cycles :',
          bullets: [
            'Entrée générale : 08h00 pour tous les élèves (Primaire, Moyen, Lycée).',
            'Jours réguliers (Dimanche, Lundi, Mercredi, Jeudi) :',
            '  • Primaire & Moyen (C.E.M) : Sortie à 15h45.',
            '  • Secondaire (Lycée) : Sortie à 16h00.',
            'Mardi (Horaire allégé) :',
            '  • Lycée (Secondaire) : Sortie anticipée à 12h00.',
            '  • Primaire & Moyen (C.E.M) : Sortie anticipée à 12h15.',
          ],
          actionLink: {
            text: 'Consulter la grille des horaires',
            href: '#horaires',
          },
        };
        break;

      case 'transport':
        userText = 'Transport & Restauration';
        botResponse = {
          sender: 'bot',
          text: '🚌 Détails de nos services de transport et restauration :',
          bullets: [
            'Transport scolaire : Flotte de bus moderne et sécurisée disponible pour les zones avoisinantes (Belgaïd, Bir El Djir et environs) sur demande auprès de l’administration.',
            'Sécurité garantie : Minibus climatisés avec accompagnatrices dédiées pour veiller sur les élèves.',
            'Restauration scolaire : Déjeuners chauds équilibrés cuisinés quotidiennement sur place sous contrôle sanitaire strict, complétés par un goûter sain l’après-midi.',
          ],
          actionLink: {
            text: 'Découvrir nos services scolaires',
            href: '#services',
          },
        };
        break;

      case 'tarifs':
        userText = 'Tarifs & Inscription';
        botResponse = {
          sender: 'bot',
          text: '📋 Tarification et modalités d’inscription :',
          bullets: [
            'Une tarification sur-mesure : Nos tarifs sont adaptés en fonction du cycle scolaire (Primaire, Moyen ou Lycée) et des options sélectionnées (transport scolaire et restauration).',
            'Devis officiel : La grille tarifaire exacte et personnalisée vous est communiquée sur place lors de votre visite à l’école.',
            'Simulateur indicatif : Vous pouvez estimer vos coûts et réserver votre place sans engagement via notre formulaire de pré-inscription en ligne !',
          ],
          actionLink: {
            text: 'Remplir la pré-inscription en ligne',
            href: '#pre-inscription',
          },
        };
        break;

      case 'contact':
        userText = 'Contact & Adresse';
        botResponse = {
          sender: 'bot',
          text: '📍 Coordonnées et accès à l’établissement :',
          bullets: [
            'Adresse : Belgaïd, Commune de Bir El Djir, Oran, Algérie (à proximité immédiate de TITAN Gym & en face de la Coopérative Panorama).',
            'Téléphone direct : 0697 47 17 73 (Secrétariat & Inscriptions).',
            'Email : cem.iqra@gmail.com',
            'Horaires d’accueil : Dimanche au Jeudi de 08h00 à 16h30.',
          ],
          actionLink: {
            text: 'Voir sur Google Maps (Belgaïd)',
            href: 'https://www.google.com/maps/place/Ecole+Priv%C3%A9e+IQRAA/@35.7583679,-0.5420885,16z/data=!4m6!3m5!1s0xd7e7cbef9885777:0x886347f60f278628!8m2!3d35.7583679!4d-0.5420885!16s%2Fg%2F11c1xp1476',
            isExternal: true,
          },
        };
        break;
    }

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: now,
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          ...botResponse,
          id: `bot-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 450);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const lower = inputValue.toLowerCase();
    setInputValue('');

    if (lower.includes('heure') || lower.includes('horaire') || lower.includes('temps') || lower.includes('mardi') || lower.includes('matin') || lower.includes('soir')) {
      handleQuickReply('horaires');
    } else if (lower.includes('transport') || lower.includes('bus') || lower.includes('cantine') || lower.includes('repas') || lower.includes('manger') || lower.includes('gouter')) {
      handleQuickReply('transport');
    } else if (lower.includes('tarif') || lower.includes('prix') || lower.includes('frais') || lower.includes('cout') || lower.includes('inscri') || lower.includes('combien')) {
      handleQuickReply('tarifs');
    } else if (lower.includes('contact') || lower.includes('adresse') || lower.includes('tel') || lower.includes('numero') || lower.includes('oran') || lower.includes('belgaid') || lower.includes('mail')) {
      handleQuickReply('contact');
    } else {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: inputValue,
        timestamp: now,
      };
      setMessages(prev => [...prev, userMsg]);
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: 'Merci pour votre message ! Pour une réponse rapide, vous pouvez cliquer sur l’un de nos thèmes principaux ci-dessous ou joindre notre secrétariat au 0697 47 17 73 :',
            bullets: [
              'Horaires de cours (Semaine & Mardi)',
              'Transport scolaire & Restauration',
              'Tarifs personnalisés & Pré-inscription',
              'Plan d’accès à Belgaïd, Oran',
            ],
            actionLink: {
              text: 'Appeler le 0697 47 17 73',
              href: 'tel:0697471773',
            },
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 500);
    }
  };

  const handleReset = () => {
    setMessages([initialBotMessage]);
  };

  return (
    <aside aria-label="Assistant virtuel" className="fixed bottom-5 right-5 z-50">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center space-x-3 bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:shadow-sky-500/40 transition-all transform hover:-translate-y-1 active:translate-y-0"
          aria-label="Ouvrir l'assistant virtuel"
        >
          <div className="relative w-8 h-8 rounded-full bg-white p-0.5 flex items-center justify-center shrink-0 shadow-xs">
            <SchoolLogo size="sm" className="w-full h-full" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold leading-tight flex items-center space-x-1">
              <span>Assistant Virtuel IQRAA</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </span>
            <span className="text-[10px] text-sky-200">Réponse instantanée 24/7</span>
          </div>
        </button>
      )}

      {/* Sleek Floating Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-[92vw] sm:w-[410px] max-h-[600px] h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0F172A] to-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-md">
                <SchoolLogo size="sm" className="w-full h-full" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <div className="font-extrabold text-sm flex items-center space-x-1.5">
                  <span>Assistant Virtuel IQRAA</span>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono">
                    Officiel
                  </span>
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                  <span>En ligne • Belgaïd, Oran</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleReset}
                title="Réinitialiser la conversation"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Fermer le chat"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 text-xs sm:text-[13px]">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#0284C7] text-white rounded-br-xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Bullet points if available */}
                  {msg.bullets && msg.bullets.length > 0 && (
                    <ul className="mt-2.5 space-y-1.5 border-t border-slate-100 pt-2 text-slate-700">
                      {msg.bullets.map((b, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-[#0284C7] font-bold mt-0.5">•</span>
                          <span className="font-normal">{b.replace(/^•\s*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Action Link button */}
                  {msg.actionLink && (
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <a
                        href={msg.actionLink.href}
                        target={msg.actionLink.isExternal ? '_blank' : undefined}
                        rel={msg.actionLink.isExternal ? 'noopener noreferrer' : undefined}
                        onClick={() => {
                          if (!msg.actionLink?.isExternal) {
                            setIsOpen(false);
                          }
                        }}
                        className="inline-flex items-center space-x-1 text-[#0284C7] hover:text-[#0369A1] font-bold hover:underline"
                      >
                        <span>{msg.actionLink.text}</span>
                        {msg.actionLink.isExternal ? (
                          <ExternalLink className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </a>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center space-x-1.5 bg-white border border-slate-200 p-2.5 rounded-2xl w-20 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick-Reply Action Chips */}
          <div className="p-2.5 bg-white border-t border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
              Questions Fréquentes :
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleQuickReply('horaires')}
                className="flex items-center space-x-1.5 bg-sky-50 hover:bg-sky-100 text-[#0284C7] p-2 rounded-xl text-left font-bold text-[11px] border border-sky-200/70 transition-colors"
              >
                <Clock className="w-3.5 h-3.5 shrink-0 text-[#0284C7]" />
                <span className="truncate">Horaires de cours</span>
              </button>

              <button
                onClick={() => handleQuickReply('transport')}
                className="flex items-center space-x-1.5 bg-orange-50 hover:bg-orange-100 text-[#F97316] p-2 rounded-xl text-left font-bold text-[11px] border border-orange-200/70 transition-colors"
              >
                <Bus className="w-3.5 h-3.5 shrink-0 text-[#F97316]" />
                <span className="truncate">Transport & Cantine</span>
              </button>

              <button
                onClick={() => handleQuickReply('tarifs')}
                className="flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-2 rounded-xl text-left font-bold text-[11px] border border-emerald-200/70 transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span className="truncate">Tarifs & Inscription</span>
              </button>

              <button
                onClick={() => handleQuickReply('contact')}
                className="flex items-center space-x-1.5 bg-red-50 hover:bg-red-100 text-[#DC2626] p-2 rounded-xl text-left font-bold text-[11px] border border-red-200/70 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 shrink-0 text-[#DC2626]" />
                <span className="truncate">Contact & Adresse</span>
              </button>
            </div>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleCustomSubmit}
            className="p-3 bg-slate-50 border-t border-slate-200 flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Posez votre question ici..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0284C7]"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-40 text-white p-2 rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Call shortcut strip */}
          <div className="bg-slate-100 py-1.5 px-3 text-[10px] text-slate-600 flex items-center justify-between border-t border-slate-200">
            <span>Accueil : Dimanche - Jeudi (08h00 - 16h30)</span>
            <a
              href="tel:0697471773"
              className="font-bold text-[#0284C7] hover:underline flex items-center space-x-1"
            >
              <Phone className="w-2.5 h-2.5" />
              <span>0697 47 17 73</span>
            </a>
          </div>
        </div>
      )}
    </aside>
  );
};
