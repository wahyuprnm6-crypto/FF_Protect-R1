import React from 'react';
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Hand, 
  Pin, 
  Sparkles, 
  Building2, 
  Home, 
  Shield, 
  Volume2
} from 'lucide-react';
import { ASNProfile } from '../../types';

export interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

interface VirtualVideoTileProps {
  asn: ASNProfile;
  isCurrentUser: boolean;
  isMicOn: boolean;
  isCamOn: boolean;
  isSpeaking: boolean;
  isHandRaised: boolean;
  handQueueNumber?: number;
  isPinned?: boolean;
  onTogglePin?: () => void;
  onSendDirectMessage?: () => void;
  virtualBackground?: 'NONE' | 'KAMPUS_BALONGSARI' | 'LOBBY_GARUDA' | 'PODCAST_STUDIO' | 'BERAKHLAK_BLUE';
  reactions?: FloatingReaction[];
  userMediaStream?: MediaStream | null;
  size?: 'normal' | 'spotlight' | 'mini';
}

export const VirtualVideoTile: React.FC<VirtualVideoTileProps> = ({
  asn,
  isCurrentUser,
  isMicOn,
  isCamOn,
  isSpeaking,
  isHandRaised,
  handQueueNumber,
  isPinned,
  onTogglePin,
  onSendDirectMessage,
  virtualBackground = 'KAMPUS_BALONGSARI',
  reactions = [],
  userMediaStream,
  size = 'normal',
}) => {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Attach real webcam stream if available for current user
  React.useEffect(() => {
    if (isCurrentUser && isCamOn && userMediaStream && videoRef.current) {
      videoRef.current.srcObject = userMediaStream;
      videoRef.current.play().catch(() => {});
    }
  }, [isCurrentUser, isCamOn, userMediaStream]);

  // Background styling mapping
  const bgStyles: Record<string, string> = {
    NONE: 'bg-linear-to-b from-slate-800 to-slate-950',
    KAMPUS_BALONGSARI: 'bg-linear-to-tr from-emerald-950 via-slate-900 to-teal-950',
    LOBBY_GARUDA: 'bg-linear-to-tr from-amber-950 via-slate-900 to-blue-950',
    PODCAST_STUDIO: 'bg-linear-to-tr from-indigo-950 via-purple-950 to-slate-950',
    BERAKHLAK_BLUE: 'bg-linear-to-tr from-blue-950 via-sky-950 to-slate-900',
  };

  const bgPatternNames: Record<string, string> = {
    NONE: 'Standar Polos',
    KAMPUS_BALONGSARI: '🏢 Kampus Utama Balongsari',
    LOBBY_GARUDA: '🦅 Auditorium Garuda',
    PODCAST_STUDIO: '🎙️ Studio Podcast Kediklatan',
    BERAKHLAK_BLUE: '🇮🇩 Core Values ASN BerAKHLAK',
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden shadow-lg border transition-all duration-300 group flex flex-col justify-between ${
        isSpeaking
          ? 'border-emerald-400 ring-2 ring-emerald-400/50 shadow-emerald-950/50'
          : isHandRaised
          ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-amber-950/40'
          : 'border-slate-800/80 hover:border-slate-700 bg-slate-900'
      } ${
        size === 'spotlight'
          ? 'w-full h-full min-h-[360px] sm:min-h-[460px]'
          : size === 'mini'
          ? 'w-48 h-32'
          : 'w-full aspect-video min-h-[190px]'
      } ${bgStyles[virtualBackground] || bgStyles.KAMPUS_BALONGSARI}`}
    >
      {/* Background Ambience Layer */}
      <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
        {virtualBackground === 'KAMPUS_BALONGSARI' && (
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:18px_18px] opacity-20" />
        )}
        {virtualBackground === 'LOBBY_GARUDA' && (
          <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
        )}
        {virtualBackground === 'PODCAST_STUDIO' && (
          <div className="absolute inset-0 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
        )}
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl" />
      </div>

      {/* Floating Reactions overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {reactions.map((r) => (
          <span
            key={r.id}
            className="absolute text-2xl sm:text-3xl animate-bounce"
            style={{
              left: `${r.x}%`,
              bottom: '25%',
              animation: 'floatUp 2.5s ease-out forwards',
            }}
          >
            {r.emoji}
          </span>
        ))}
      </div>

      {/* Top Header Information in Tile */}
      <div className="relative z-10 p-2.5 sm:p-3 flex items-center justify-between text-xs">
        {/* Left: Location & Role badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {asn.statusHariIni === 'WFH' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 text-[10px] font-bold backdrop-blur-xs">
              <Home className="w-2.5 h-2.5" />
              <span>WFH</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold backdrop-blur-xs">
              <Building2 className="w-2.5 h-2.5" />
              <span>WFO Balongsari</span>
            </span>
          )}

          {asn.role === 'KEPALA_BPSDM' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/30 text-amber-200 border border-amber-400/50 text-[10px] font-extrabold backdrop-blur-xs shadow-xs">
              <Shield className="w-2.5 h-2.5 text-amber-300" />
              <span>Host / Kepala BPSDM</span>
            </span>
          )}

          {isCurrentUser && (
            <span className="px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/40 text-[10px] font-semibold">
              Anda
            </span>
          )}
        </div>

        {/* Right: Hand Raised & Pin controls */}
        <div className="flex items-center gap-1">
          {isHandRaised && (
            <div className="flex items-center gap-1 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md font-bold text-[11px] shadow-sm animate-pulse">
              <Hand className="w-3 h-3" />
              <span>Antrean #{handQueueNumber || 1}</span>
            </div>
          )}

          {onTogglePin && (
            <button
              onClick={onTogglePin}
              title={isPinned ? 'Lepas Pin Video' : 'Sematkan Video Peserta'}
              className={`p-1.5 rounded-lg transition ${
                isPinned
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-black/40 text-slate-300 hover:text-white hover:bg-black/60 opacity-0 group-hover:opacity-100'
              }`}
            >
              <Pin className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Center Video Area: Real Webcam OR Virtual Avatar Simulation */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-2">
        {isCamOn && isCurrentUser && userMediaStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-xl shadow-inner border border-white/10"
          />
        ) : isCamOn ? (
          // Simulated Active Camera Feed with animated framing
          <div className="relative flex flex-col items-center justify-center">
            {/* Pulsing glow ring if speaking */}
            <div
              className={`relative rounded-full p-1 transition-all duration-300 ${
                isSpeaking
                  ? 'ring-4 ring-emerald-400 ring-offset-4 ring-offset-slate-900 shadow-xl shadow-emerald-500/30 animate-pulse'
                  : ''
              }`}
            >
              <img
                src={
                  asn.fotoUrl ||
                  `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces`
                }
                alt={asn.nama}
                referrerPolicy="no-referrer"
                className={`rounded-full object-cover border-2 border-white/20 shadow-xl transition-transform ${
                  size === 'spotlight'
                    ? 'w-28 h-28 sm:w-36 sm:h-36'
                    : size === 'mini'
                    ? 'w-12 h-12'
                    : 'w-20 h-20 sm:w-24 sm:h-24'
                }`}
              />

              {/* Speaking audio wave indicator on avatar */}
              {isSpeaking && (
                <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-full shadow-md border-2 border-slate-900 animate-bounce">
                  <Volume2 className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            {/* Virtual Background watermark text */}
            <span className="mt-2 text-[10px] text-slate-400/90 font-mono bg-black/40 px-2 py-0.5 rounded-full border border-white/5 backdrop-blur-xs">
              {bgPatternNames[virtualBackground]}
            </span>
          </div>
        ) : (
          // Camera Off State
          <div className="flex flex-col items-center justify-center text-center">
            <div
              className={`rounded-full flex items-center justify-center font-bold text-white shadow-md border border-white/10 ${
                asn.role === 'KEPALA_BPSDM'
                  ? 'bg-amber-600'
                  : asn.unitKerjaId === 'pk_manajerial'
                  ? 'bg-blue-600'
                  : asn.unitKerjaId === 'pk_teknis'
                  ? 'bg-purple-600'
                  : 'bg-emerald-600'
              } ${
                size === 'spotlight'
                  ? 'w-24 h-24 sm:w-32 sm:h-32 text-2xl sm:text-3xl'
                  : size === 'mini'
                  ? 'w-10 h-10 text-sm'
                  : 'w-16 h-16 sm:w-20 sm:h-20 text-lg sm:text-xl'
              }`}
            >
              {asn.nama
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <span className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 font-medium bg-black/50 px-2 py-0.5 rounded-full">
              <VideoOff className="w-3 h-3 text-rose-400" />
              <span>Kamera Dinonaktifkan</span>
            </span>
          </div>
        )}
      </div>

      {/* Bottom Information Bar: Name, NIP, Mic Status & Audio Waveform */}
      <div className="relative z-10 bg-slate-950/80 backdrop-blur-md px-3 py-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white text-xs sm:text-sm truncate">
              {asn.nama}
            </span>
            {isSpeaking && (
              /* Simulated real-time live audio visualizer equalizer */
              <div className="flex items-center gap-0.5 h-3 ml-1 shrink-0">
                <span className="w-0.5 h-full bg-emerald-400 rounded-full animate-[pulse_0.4s_infinite]" />
                <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-[pulse_0.6s_infinite]" />
                <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-[pulse_0.3s_infinite]" />
                <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-[pulse_0.5s_infinite]" />
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-400 truncate">
            {asn.jabatan} • NIP {asn.nip}
          </p>
        </div>

        {/* Mic & Cam Indicators */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            title={isMicOn ? 'Mikrofon Aktif' : 'Mikrofon Dibisukan (Muted)'}
            className={`p-1.5 rounded-md ${
              isMicOn
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}
          >
            {isMicOn ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
          </div>

          <div
            title={isCamOn ? 'Kamera Aktif' : 'Kamera Mati'}
            className={`p-1.5 rounded-md ${
              isCamOn
                ? 'bg-slate-800 text-slate-300'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}
          >
            {isCamOn ? <VideoIcon className="w-3 h-3" /> : <VideoOff className="w-3 h-3" />}
          </div>
        </div>
      </div>
    </div>
  );
};
