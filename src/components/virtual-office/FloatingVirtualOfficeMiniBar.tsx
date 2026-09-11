import React from 'react';
import { 
  Maximize2, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Hand, 
  Users, 
  MessageSquare, 
  PhoneOff, 
  Sparkles,
  Volume2
} from 'lucide-react';
import { ASNProfile } from '../../types';

interface FloatingVirtualOfficeMiniBarProps {
  roomName: string;
  activeSpeaker?: ASNProfile;
  participantCount: number;
  isMicOn: boolean;
  isCamOn: boolean;
  isHandRaised: boolean;
  unreadChatCount: number;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleHand: () => void;
  onMaximize: () => void;
  onLeaveRoom: () => void;
}

export const FloatingVirtualOfficeMiniBar: React.FC<FloatingVirtualOfficeMiniBarProps> = ({
  roomName,
  activeSpeaker,
  participantCount,
  isMicOn,
  isCamOn,
  isHandRaised,
  unreadChatCount,
  onToggleMic,
  onToggleCam,
  onToggleHand,
  onMaximize,
  onLeaveRoom,
}) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-950/95 text-white rounded-2xl p-3 shadow-2xl border border-emerald-500/40 backdrop-blur-xl flex items-center gap-3.5 max-w-md ring-1 ring-white/10">
        {/* Active speaker mini preview avatar */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border-2 border-emerald-400 relative">
            <img
              src={
                activeSpeaker?.fotoUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
              }
              alt={activeSpeaker?.nama || 'Speaker'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {/* Pulsing speaking badge */}
            <span className="absolute bottom-0.5 right-0.5 p-0.5 bg-emerald-500 rounded-full animate-pulse text-white">
              <Volume2 className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>

        {/* Room & Active info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <h5 className="font-bold text-xs truncate max-w-[150px] sm:max-w-[180px] text-white">
              {roomName}
            </h5>
          </div>
          <p className="text-[11px] text-slate-300 truncate mt-0.5">
            Bicara: <span className="font-semibold text-emerald-300">{activeSpeaker?.nama || 'Peserta'}</span>
          </p>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-cyan-400" />
              <span>{participantCount} Online</span>
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-mono">TERHUBUNG ZOOM</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-slate-800">
          {/* Toggle Mic */}
          <button
            onClick={onToggleMic}
            title={isMicOn ? 'Bisukan Mikrofon' : 'Nyalakan Mikrofon'}
            className={`p-2 rounded-xl transition ${
              isMicOn
                ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                : 'bg-rose-600 text-white hover:bg-rose-500'
            }`}
          >
            {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          </button>

          {/* Toggle Cam */}
          <button
            onClick={onToggleCam}
            title={isCamOn ? 'Matikan Kamera' : 'Nyalakan Kamera'}
            className={`p-2 rounded-xl transition ${
              isCamOn
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'bg-rose-600 text-white hover:bg-rose-500'
            }`}
          >
            {isCamOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
          </button>

          {/* Raise Hand */}
          <button
            onClick={onToggleHand}
            title={isHandRaised ? 'Turunkan Tangan' : 'Angkat Tangan'}
            className={`p-2 rounded-xl transition ${
              isHandRaised
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
          </button>

          {/* Maximize to full room */}
          <button
            onClick={onMaximize}
            title="Perbesar Tampilan Ruang Zoom"
            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-sm"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Leave */}
          <button
            onClick={onLeaveRoom}
            title="Keluar dari Rapat Virtual"
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
