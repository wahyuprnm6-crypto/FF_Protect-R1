import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, ShieldCheck, BookOpen, FileCheck } from 'lucide-react';
import { apiService } from '../services/api';
import { ASNProfile, QuotaCalculation } from '../types';

interface AiAdvisorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentAsn: ASNProfile;
  quotas: QuotaCalculation[];
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AiAdvisorDrawer: React.FC<AiAdvisorDrawerProps> = ({
  isOpen,
  onClose,
  currentAsn,
  quotas,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Selamat datang di Asisten Cerdas Si-Praja SPBE BPSDM Provinsi Jawa Timur. 

Saya siap membantu Anda dalam:
1. Konsultasi regulasi FWA & kuota maksimal 50% WFH (Perpres No. 21/2023).
2. Perumusan Target Luaran Kinerja Harian ASN (PermenPANRB No. 6/2022).
3. Penyusunan instrumen kediklatan (RPS Modul, Jam Mengajar Widyaiswara, Evaluasi Pasca Pelatihan / EPP).

Ada yang dapat saya bantu untuk penugasan kediklatan Anda hari ini?`,
      timestamp: 'Baru saja',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputText;
    if (!promptToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setIsLoading(true);

    try {
      const reply = await apiService.consultAi(promptToSend, {
        currentAsn: {
          nama: currentAsn.nama,
          jabatan: currentAsn.jabatan,
          unitKerjaId: currentAsn.unitKerjaId,
          role: currentAsn.role,
        },
        activeQuotas: quotas,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'Maaf, terjadi kendala saat memproses konsultasi. Silakan periksa koneksi atau coba beberapa saat lagi.',
          timestamp: 'Sekarang',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Bagaimana aturan pembatasan kuota WFH 50% sesuai Perpres 21/2023?',
    'Bantu saya merumuskan target luaran SKP harian untuk review modul kediklatan.',
    'Apa saja tahapan Evaluasi Pasca Pelatihan (EPP) 3-6 bulan sesuai standar LAN RI?',
    'Bagaimana sinkronisasi presensi FWA dengan pembelajaran daring LMS Si-Praja?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-600/80 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <span>Si-Praja Smart SPBE Assistant</span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Pemerintah Provinsi Jawa Timur • BPSDM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-slate-50 p-2.5 border-b border-slate-200 flex gap-1.5 overflow-x-auto text-[11px]">
          {quickPrompts.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="bg-white hover:bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs shrink-0 whitespace-nowrap"
            >
              {q.length > 35 ? q.substring(0, 35) + '...' : q}
            </button>
          ))}
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                }`}
              >
                {m.text}
                <div
                  className={`text-[9px] mt-1 text-right ${
                    m.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                  {currentAsn.nama.charAt(0)}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-slate-400 italic text-[11px]">
              <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>Si-Praja AI sedang menyusun jawaban regulasi...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tanyakan tata kelola SPBE, kuota WFH, atau draft SKP..."
              className="flex-1 text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-normal"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl disabled:opacity-50 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
