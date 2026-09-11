import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  Hand, 
  MessageSquare, 
  Users, 
  PhoneOff, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  Settings, 
  Grid, 
  UserCheck, 
  Share2, 
  Copy, 
  Check, 
  Building2, 
  Home, 
  Smile, 
  FileText, 
  Send, 
  Download, 
  ShieldCheck, 
  Volume2, 
  Layers, 
  Coffee, 
  Radio, 
  Crown,
  Lock,
  ChevronDown
} from 'lucide-react';
import { ASNProfile, UnitKerjaId } from '../../types';
import { VirtualVideoTile, FloatingReaction } from './VirtualVideoTile';
import { VirtualScreenShare } from './VirtualScreenShare';
import { VirtualWhiteboard } from './VirtualWhiteboard';
import { 
  playJoinMeetingSound, 
  playLeaveMeetingSound, 
  playRaiseHandSound, 
  playChatMessageSound, 
  playToggleMicSound, 
  playReactionSound 
} from '../../utils/audioEffects';

export interface VirtualOfficeMeetingRoom {
  id: string;
  name: string;
  subtitle: string;
  category: 'RAPAT_PIMPINAN' | 'BIDANG_KOORDINASI' | 'LAB_SPBE' | 'AUDITORIUM' | 'COFFEE_LOUNGE';
  icon: string;
  defaultTopic: string;
  unitKerjaId?: UnitKerjaId;
  participantCount: number;
}

export const VIRTUAL_ROOMS: VirtualOfficeMeetingRoom[] = [
  {
    id: 'room-balongsari-utama',
    name: 'Ruang Sidang Utama Balongsari',
    subtitle: 'Rapat Pleno Koordinasi Pimpinan & Widyaiswara Ahli Utama',
    category: 'RAPAT_PIMPINAN',
    icon: '🏢',
    defaultTopic: 'Sinkronisasi Kebijakan WFA 100% (SE No. 800/1141/204/2026) & Evaluasi Layanan Diklat',
    participantCount: 8,
  },
  {
    id: 'room-pk-manajerial',
    name: 'Pod Bidang PK Manajerial',
    subtitle: 'Ruang Koordinasi Pelatihan Kepemimpinan (PKN II, PKA, PKP)',
    category: 'BIDANG_KOORDINASI',
    icon: '👔',
    defaultTopic: 'Pembahasan Kurikulum BerAKHLAK dan Jadwal Mentor Aksi Perubahan',
    unitKerjaId: 'pk_manajerial',
    participantCount: 5,
  },
  {
    id: 'room-pk-teknis-spbe',
    name: 'Pod Bidang PK Teknis & SPBE',
    subtitle: 'Digital Lab Transformasi Pemerintahan & Integrasi Si-Praja',
    category: 'LAB_SPBE',
    icon: '💻',
    defaultTopic: 'Uji Coba Sistem Presensi 3x Sehari & Otomasi Eviden Kinerja Google Drive',
    unitKerjaId: 'pk_teknis',
    participantCount: 6,
  },
  {
    id: 'room-pk-fungsional',
    name: 'Pod Bidang PK Fungsional & Soskul',
    subtitle: 'Pengembangan Modul Diklat Teknis Fungsional & Asesor',
    category: 'BIDANG_KOORDINASI',
    icon: '📚',
    defaultTopic: 'Review RPS Pelatihan Pengadaan Barang Jasa & Sertifikasi SDM Balongsari',
    unitKerjaId: 'pk_fungsional_soskul',
    participantCount: 4,
  },
  {
    id: 'room-coffee-lounge',
    name: 'Lounge Virtual ASN (Coffee Break & Santai)',
    subtitle: 'Ruang Interaksi Informal Pegawai WFH & WFO Antar-Jam Presensi',
    category: 'COFFEE_LOUNGE',
    icon: '☕',
    defaultTopic: 'Pojok Diskusi Hangat Pegawai BPSDM Provinsi Jawa Timur',
    participantCount: 7,
  },
];

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderJabatan: string;
  senderAvatar?: string;
  senderRole?: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

interface VirtualOfficeZoomRoomProps {
  currentAsn: ASNProfile;
  allAsn: ASNProfile[];
  onMinimizeToPiP?: () => void;
  onRecordMeetingPresence?: (roomName: string) => void;
}

export const VirtualOfficeZoomRoom: React.FC<VirtualOfficeZoomRoomProps> = ({
  currentAsn,
  allAsn,
  onMinimizeToPiP,
  onRecordMeetingPresence,
}) => {
  // Join state
  const [isInMeeting, setIsInMeeting] = useState<boolean>(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room-balongsari-utama');
  const activeRoom = VIRTUAL_ROOMS.find((r) => r.id === selectedRoomId) || VIRTUAL_ROOMS[0];

  // Media Controls
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isCamOn, setIsCamOn] = useState<boolean>(true);
  const [userMediaStream, setUserMediaStream] = useState<MediaStream | null>(null);
  const [virtualBackground, setVirtualBackground] = useState<
    'NONE' | 'KAMPUS_BALONGSARI' | 'LOBBY_GARUDA' | 'PODCAST_STUDIO' | 'BERAKHLAK_BLUE'
  >('KAMPUS_BALONGSARI');
  const [showBgSelector, setShowBgSelector] = useState<boolean>(false);

  // Meeting view mode
  const [viewMode, setViewMode] = useState<'gallery' | 'speaker' | 'screenshare' | 'whiteboard'>('gallery');
  const [pinnedParticipantId, setPinnedParticipantId] = useState<string | null>(null);

  // Interactive Sidebar
  const [activeSidebarTab, setActiveSidebarTab] = useState<'chat' | 'participants' | 'notes' | 'rooms'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-sys-1',
      senderId: 'system',
      senderName: 'Sistem SPBE BPSDM',
      senderJabatan: 'Enkripsi Resmi',
      text: 'Rapat virtual terhubung melalui Jalur Aman Komando BPSDM Jawa Timur (SE No. 800/1141/204/2026).',
      timestamp: '09:00',
      isSystem: true,
    },
    {
      id: 'msg-1',
      senderId: 'asn-1',
      senderName: 'Dr. Ramliyanto, S.P., M.P.',
      senderJabatan: 'Kepala BPSDM Jatim',
      text: 'Selamat pagi bapak/ibu sekalian. Pastikan seluruh peserta telah mengisi presensi pagi dan menyiapkan eviden kinerja harian.',
      timestamp: '09:02',
    },
    {
      id: 'msg-2',
      senderId: 'asn-4',
      senderName: 'Wahyu Purnomo, S.Kom.',
      senderJabatan: 'Pranata Komputer Ahli Muda',
      text: 'Siap Bapak Kepala BPSDM, integrasi Si-Praja LMS dan perekaman eviden Google Drive sudah online 100%.',
      timestamp: '09:04',
    },
  ]);
  const [inputChat, setInputChat] = useState<string>('');

  // Hand raise state
  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);
  const [handQueue, setHandQueue] = useState<string[]>([]);

  // Floating reactions state
  const [reactions, setReactions] = useState<{ [asnId: string]: FloatingReaction[] }>({});

  // Real-time Meeting Timer
  const [meetingSeconds, setMeetingSeconds] = useState<number>(1420); // starts ~23 minutes in

  // Simulated Speaking cycle
  const [activeSpeakerId, setActiveSpeakerId] = useState<string>('asn-1');

  // Copy link status
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Presence record toast
  const [presenceRecorded, setPresenceRecorded] = useState<boolean>(false);

  // Live Meeting Minutes
  const [meetingMinutes, setMeetingMinutes] = useState<string>(
`NOTULENSI RAPAT KOORDINASI VIRTUAL BPSDM PROVINSI JAWA TIMUR
Tanggal : ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
Ruang   : ${activeRoom.name}
Pimpinan: Dr. Ramliyanto, S.P., M.P. (Kepala BPSDM)

POKOK BAHASAN:
1. Pelaksanaan Fleksibilitas Tugas Kedinasan (WFA hingga 100%) merujuk SE No. 800/1141/204/2026 berjalan tertib di seluruh 5 unit kerja.
2. Disiplin Presensi 3x Sehari (Pagi 07.30 WIB, Siang 12.00-13.00 WIB, Sore 16.00 WIB) wajib ditaati ASN WFH dan WFO.
3. Seluruh luaran kinerja harian SKP wajib melampirkan tautan bukti fisik di Google Drive resmi BPSDM Jatim.
4. Bidang PK Manajerial mematangkan persiapan pembukaan Pelatihan Kepemimpinan Nasional (PKN II).
5. UPT Sertifikasi Mutu SDM mempersiapkan asesmen kompetensi asesor BNSP di Kampus Utama Balongsari Surabaya.`
  );

  // Filter participants for current room (current user + selected roster from allAsn)
  const roomParticipants: ASNProfile[] = React.useMemo(() => {
    // Current user always included
    const otherAsn = allAsn.filter((a) => a.id !== currentAsn.id);
    // Grab representative ASN for this room based on category
    let matchedOthers: ASNProfile[] = [];
    if (activeRoom.unitKerjaId) {
      matchedOthers = otherAsn.filter((a) => a.unitKerjaId === activeRoom.unitKerjaId);
    }
    if (matchedOthers.length < 5) {
      matchedOthers = [...matchedOthers, ...otherAsn.filter((a) => !matchedOthers.includes(a))];
    }
    return [currentAsn, ...matchedOthers.slice(0, 7)];
  }, [allAsn, currentAsn, activeRoom]);

  // Meeting timer
  useEffect(() => {
    if (!isInMeeting) return;
    const timer = setInterval(() => {
      setMeetingSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isInMeeting]);

  // Simulated natural speaker switching every few seconds
  useEffect(() => {
    if (!isInMeeting || isMicOn) return;
    const interval = setInterval(() => {
      // Pick random participant other than current user if mic is off
      const pool = roomParticipants.map((p) => p.id);
      const randomId = pool[Math.floor(Math.random() * pool.length)];
      setActiveSpeakerId(randomId);
    }, 9000);
    return () => clearInterval(interval);
  }, [isInMeeting, roomParticipants, isMicOn]);

  // Format timer as HH:MM:SS
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : ''}${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle mic
  const handleToggleMic = () => {
    const nextState = !isMicOn;
    setIsMicOn(nextState);
    playToggleMicSound(nextState);
    if (nextState) {
      setActiveSpeakerId(currentAsn.id);
    }
  };

  // Toggle camera with real webcam support if user allows
  const handleToggleCam = async () => {
    if (isCamOn) {
      // Stop real stream if active
      if (userMediaStream) {
        userMediaStream.getTracks().forEach((track) => track.stop());
        setUserMediaStream(null);
      }
      setIsCamOn(false);
    } else {
      setIsCamOn(true);
      // Try optional real user media
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setUserMediaStream(stream);
        }
      } catch {
        // Fallback to simulated avatar with BPSDM virtual background
      }
    }
  };

  // Handle raise hand
  const handleToggleHand = () => {
    const next = !isHandRaised;
    setIsHandRaised(next);
    if (next) {
      playRaiseHandSound();
      setHandQueue((prev) => (prev.includes(currentAsn.id) ? prev : [...prev, currentAsn.id]));
      // Notify in chat
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-hand-${Date.now()}`,
          senderId: 'system',
          senderName: 'Sistem Ruang Rapat',
          senderJabatan: 'Antrean Bicara',
          text: `🙋‍♂️ ${currentAsn.nama} mengangkat tangan (Antrean #${handQueue.length + 1}).`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          isSystem: true,
        },
      ]);
    } else {
      setHandQueue((prev) => prev.filter((id) => id !== currentAsn.id));
    }
  };

  // Trigger floating reaction
  const handleSendReaction = (emoji: string) => {
    playReactionSound();
    const newReaction: FloatingReaction = {
      id: `react-${Date.now()}-${Math.random()}`,
      emoji,
      x: 30 + Math.random() * 40,
    };
    setReactions((prev) => ({
      ...prev,
      [currentAsn.id]: [...(prev[currentAsn.id] || []), newReaction],
    }));

    // Cleanup reaction after 2.5s
    setTimeout(() => {
      setReactions((prev) => ({
        ...prev,
        [currentAsn.id]: (prev[currentAsn.id] || []).filter((r) => r.id !== newReaction.id),
      }));
    }, 2500);
  };

  // Send chat message
  const handleSendMessage = () => {
    if (!inputChat.trim()) return;
    playChatMessageSound();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentAsn.id,
      senderName: currentAsn.nama,
      senderJabatan: currentAsn.jabatan,
      senderAvatar: currentAsn.fotoUrl,
      senderRole: currentAsn.role,
      text: inputChat.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputChat('');
  };

  // Copy meeting link
  const handleCopyLink = () => {
    const link = `https://meet.bpsdm.jatimprov.go.id/${activeRoom.id}`;
    navigator.clipboard?.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Record meeting presence in SPBE
  const handleVerifyPresence = () => {
    setPresenceRecorded(true);
    if (onRecordMeetingPresence) {
      onRecordMeetingPresence(activeRoom.name);
    }
    setTimeout(() => setPresenceRecorded(false), 3500);
  };

  // Join room
  const handleJoinMeeting = (roomId: string) => {
    setSelectedRoomId(roomId);
    setIsInMeeting(true);
    playJoinMeetingSound();
    // Add welcome notification
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-join-${Date.now()}`,
        senderId: 'system',
        senderName: 'Sistem Rapat',
        senderJabatan: 'Notifikasi Kehadiran',
        text: `🟢 ${currentAsn.nama} bergabung ke ${VIRTUAL_ROOMS.find((r) => r.id === roomId)?.name || 'Ruang Rapat'}.`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
      },
    ]);
  };

  // Leave room
  const handleLeaveMeeting = () => {
    playLeaveMeetingSound();
    if (userMediaStream) {
      userMediaStream.getTracks().forEach((track) => track.stop());
      setUserMediaStream(null);
    }
    setIsInMeeting(false);
  };

  const activeSpeaker = roomParticipants.find((p) => p.id === activeSpeakerId) || currentAsn;

  // Render PRE-JOIN LOBBY if not in meeting
  if (!isInMeeting) {
    return (
      <div className="space-y-6">
        {/* Lobby Header */}
        <div className="bg-linear-to-r from-slate-900 via-emerald-950 to-blue-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-400/30">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Lobi Kantor Virtual & Zoom Meeting BPSDM Jawa Timur
              </span>
              <h2 className="text-xl sm:text-2xl font-black mt-2">
                Pilih Ruang Rapat & Pod Kolaborasi Virtual
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Terhubung langsung dengan pimpinan, rekan satu bidang, dan seluruh pegawai BPSDM Jawa Timur yang berdinas secara WFH maupun WFO sesuai SE No. 800/1141/204/2026.
              </p>
            </div>

            {/* Quick check status badge */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">STATUS KONEKSI SPBE:</span>
                <strong className="text-white">Aman & Terenkripsi 256-bit</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Room Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VIRTUAL_ROOMS.map((room) => (
            <div
              key={room.id}
              className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between shadow-md bg-white hover:border-emerald-500 hover:shadow-lg ${
                selectedRoomId === room.id ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-3xl p-2 rounded-xl bg-slate-100 border border-slate-200">
                    {room.icon}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <Users className="w-3 h-3 text-emerald-600" />
                    <span>{room.participantCount} Pegawai Online</span>
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-tight">
                  {room.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {room.subtitle}
                </p>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800 block text-[10px] uppercase font-mono">
                    Topik Pembahasan:
                  </span>
                  <p className="mt-0.5 italic">"{room.defaultTopic}"</p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">BPSDM JATIM ROOM</span>
                <button
                  onClick={() => handleJoinMeeting(room.id)}
                  className="px-4 py-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Masuk Ruang Ini</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render IN-MEETING VIRTUAL OFFICE ZOOM VIEW
  return (
    <div className="space-y-4">
      {/* Top Meeting Control & Information Bar */}
      <div className="bg-slate-950 text-white rounded-2xl px-4 py-3 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Room Title, Category & Timer */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                <span>{activeRoom.name}</span>
              </h3>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE {formatTimer(meetingSeconds)} WIB</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                <Lock className="w-2.5 h-2.5 text-amber-400" />
                <span>Enkripsi SPBE</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-xl mt-0.5">
              Topik: <span className="text-slate-300 italic">{activeRoom.defaultTopic}</span>
            </p>
          </div>
        </div>

        {/* View Mode Switcher, Share Link, Record Presence, & PiP */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('gallery')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium transition ${
                viewMode === 'gallery' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan Galeri Kotak Video Peserta"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Galeri</span>
            </button>

            <button
              onClick={() => setViewMode('speaker')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium transition ${
                viewMode === 'speaker' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan Fokus Pembicara Aktif"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Fokus Pembicara</span>
            </button>

            <button
              onClick={() => setViewMode('screenshare')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium transition ${
                viewMode === 'screenshare' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan Paparan Materi / Bagi Layar"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Paparan</span>
            </button>

            <button
              onClick={() => setViewMode('whiteboard')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium transition ${
                viewMode === 'whiteboard' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Papan Tulis Kolaboratif & Catatan Tempel"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Papan Tulis</span>
            </button>
          </div>

          {/* Copy meeting link */}
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
            title="Salin Tautan Rapat Google Meet / Zoom"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          {/* Verify Presence in SPBE */}
          <button
            onClick={handleVerifyPresence}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-sm ${
              presenceRecorded
                ? 'bg-emerald-500 text-white'
                : 'bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-300 border border-emerald-500/40'
            }`}
            title="Catat Kehadiran Rapat ini ke Sistem Presensi Digital SPBE"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">
              {presenceRecorded ? '✓ Presensi Rapat Tercatat' : 'Catat Presensi Rapat'}
            </span>
          </button>

          {/* PiP Minimize button */}
          {onMinimizeToPiP && (
            <button
              onClick={onMinimizeToPiP}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 transition"
              title="Kecilkan ke Mode Mengambang (Picture-in-Picture) agar dapat membuka tab lain"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Stage & Sidebar Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* Left / Center Video Stage (Col-span 3 if sidebar open, Col-span 4 if closed) */}
        <div className={`${isSidebarOpen ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-3 transition-all duration-300`}>
          {/* STAGE: GALLERY VIEW */}
          {viewMode === 'gallery' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800/80 min-h-[440px] items-center">
              {roomParticipants.map((p, idx) => (
                <VirtualVideoTile
                  key={p.id}
                  asn={p}
                  isCurrentUser={p.id === currentAsn.id}
                  isMicOn={p.id === currentAsn.id ? isMicOn : idx % 2 === 0}
                  isCamOn={p.id === currentAsn.id ? isCamOn : idx !== 3}
                  isSpeaking={activeSpeakerId === p.id}
                  isHandRaised={handQueue.includes(p.id)}
                  handQueueNumber={handQueue.indexOf(p.id) + 1}
                  isPinned={pinnedParticipantId === p.id}
                  onTogglePin={() => setPinnedParticipantId(pinnedParticipantId === p.id ? null : p.id)}
                  virtualBackground={virtualBackground}
                  reactions={reactions[p.id]}
                  userMediaStream={userMediaStream}
                  size="normal"
                />
              ))}
            </div>
          )}

          {/* STAGE: SPEAKER FOCUS VIEW */}
          {viewMode === 'speaker' && (
            <div className="space-y-3">
              {/* Spotlight Active Speaker Tile */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                <VirtualVideoTile
                  asn={activeSpeaker}
                  isCurrentUser={activeSpeaker.id === currentAsn.id}
                  isMicOn={activeSpeaker.id === currentAsn.id ? isMicOn : true}
                  isCamOn={activeSpeaker.id === currentAsn.id ? isCamOn : true}
                  isSpeaking={true}
                  isHandRaised={handQueue.includes(activeSpeaker.id)}
                  virtualBackground={virtualBackground}
                  reactions={reactions[activeSpeaker.id]}
                  userMediaStream={userMediaStream}
                  size="spotlight"
                />
              </div>

              {/* Bottom Thumbnail Strip */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 px-1">
                {roomParticipants
                  .filter((p) => p.id !== activeSpeaker.id)
                  .map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setActiveSpeakerId(p.id)}
                      className="cursor-pointer shrink-0 transition-transform hover:scale-105"
                    >
                      <VirtualVideoTile
                        asn={p}
                        isCurrentUser={p.id === currentAsn.id}
                        isMicOn={p.id === currentAsn.id ? isMicOn : false}
                        isCamOn={p.id === currentAsn.id ? isCamOn : true}
                        isSpeaking={false}
                        isHandRaised={handQueue.includes(p.id)}
                        virtualBackground={virtualBackground}
                        size="mini"
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* STAGE: SCREEN SHARE MODE */}
          {viewMode === 'screenshare' && (
            <div className="space-y-3">
              <VirtualScreenShare
                presenter={activeSpeaker}
                isCurrentUserPresenter={activeSpeaker.id === currentAsn.id}
                onStopShare={() => setViewMode('gallery')}
              />

              {/* Strip of participants watching below */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {roomParticipants.map((p) => (
                  <div key={p.id} className="shrink-0">
                    <VirtualVideoTile
                      asn={p}
                      isCurrentUser={p.id === currentAsn.id}
                      isMicOn={p.id === currentAsn.id ? isMicOn : false}
                      isCamOn={p.id === currentAsn.id ? isCamOn : true}
                      isSpeaking={p.id === activeSpeaker.id}
                      isHandRaised={handQueue.includes(p.id)}
                      size="mini"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAGE: WHITEBOARD MODE */}
          {viewMode === 'whiteboard' && (
            <div className="space-y-3">
              <VirtualWhiteboard currentAsn={currentAsn} />
            </div>
          )}

          {/* BOTTOM IN-MEETING CONTROL DOCK (Like Zoom / Meet) */}
          <div className="bg-slate-950 text-white rounded-2xl px-4 py-3 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-3">
            {/* Left: Audio & Video controls */}
            <div className="flex items-center gap-2">
              {/* Mic toggle */}
              <button
                onClick={handleToggleMic}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition shadow-md ${
                  isMicOn
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    : 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-500'
                }`}
                title={isMicOn ? 'Bisukan Mikrofon' : 'Nyalakan Mikrofon'}
              >
                {isMicOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4" />}
                <span className="hidden sm:inline">{isMicOn ? 'Bisukan' : 'Nyalakan'}</span>
              </button>

              {/* Camera toggle */}
              <button
                onClick={handleToggleCam}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition shadow-md ${
                  isCamOn
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    : 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-500'
                }`}
                title={isCamOn ? 'Matikan Kamera' : 'Nyalakan Kamera'}
              >
                {isCamOn ? <Video className="w-4 h-4 text-cyan-400" /> : <VideoOff className="w-4 h-4" />}
                <span className="hidden sm:inline">{isCamOn ? 'Stop Video' : 'Mulai Video'}</span>
              </button>

              {/* Virtual background menu */}
              <div className="relative">
                <button
                  onClick={() => setShowBgSelector(!showBgSelector)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  title="Ganti Virtual Background BPSDM Jatim"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </button>

                {showBgSelector && (
                  <div className="absolute bottom-12 left-0 w-64 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl z-50 text-xs space-y-2">
                    <span className="font-bold text-white block text-[11px] border-b border-slate-800 pb-1.5">
                      Pilih Latar Virtual BPSDM
                    </span>
                    {(
                      [
                        { id: 'KAMPUS_BALONGSARI', label: '🏢 Kampus Utama Balongsari' },
                        { id: 'LOBBY_GARUDA', label: '🦅 Auditorium Garuda' },
                        { id: 'PODCAST_STUDIO', label: '🎙️ Studio Podcast Kediklatan' },
                        { id: 'BERAKHLAK_BLUE', label: '🇮🇩 Core Values ASN BerAKHLAK' },
                        { id: 'NONE', label: 'Polos Standar' },
                      ] as const
                    ).map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => {
                          setVirtualBackground(bg.id);
                          setShowBgSelector(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg transition text-[11px] flex items-center justify-between ${
                          virtualBackground === bg.id
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{bg.label}</span>
                        {virtualBackground === bg.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Center: Collaboration Tools & Reactions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Share screen toggle */}
              <button
                onClick={() => setViewMode(viewMode === 'screenshare' ? 'gallery' : 'screenshare')}
                className={`p-2 sm:px-3 sm:py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                  viewMode === 'screenshare'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title="Bagi Layar / Presentasi Materi"
              >
                <Monitor className="w-4 h-4 text-emerald-400" />
                <span className="hidden md:inline">Bagi Layar</span>
              </button>

              {/* Whiteboard toggle */}
              <button
                onClick={() => setViewMode(viewMode === 'whiteboard' ? 'gallery' : 'whiteboard')}
                className={`p-2 sm:px-3 sm:py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                  viewMode === 'whiteboard'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title="Papan Tulis Kolaboratif"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="hidden md:inline">Papan Tulis</span>
              </button>

              {/* Raise hand */}
              <button
                onClick={handleToggleHand}
                className={`p-2 sm:px-3 sm:py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                  isHandRaised
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={isHandRaised ? 'Turunkan Tangan' : 'Angkat Tangan untuk Bertanya'}
              >
                <Hand className="w-4 h-4" />
                <span className="hidden md:inline">{isHandRaised ? 'Tangan Terangkat' : 'Angkat Tangan'}</span>
              </button>

              {/* Reaction Emojis popup */}
              <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                {['👏', '👍', '☕', '💡', '🔥'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSendReaction(emoji)}
                    className="hover:scale-125 transition-transform text-sm sm:text-base p-0.5"
                    title={`Kirim reaksi ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Sidebar Toggles & Leave Meeting */}
            <div className="flex items-center gap-2">
              {/* Chat toggle */}
              <button
                onClick={() => {
                  setIsSidebarOpen(true);
                  setActiveSidebarTab('chat');
                }}
                className={`p-2 rounded-xl transition relative ${
                  isSidebarOpen && activeSidebarTab === 'chat'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title="Buka Kolom Obrolan / Chat"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {messages.length}
                </span>
              </button>

              {/* Participants toggle */}
              <button
                onClick={() => {
                  setIsSidebarOpen(true);
                  setActiveSidebarTab('participants');
                }}
                className={`p-2 rounded-xl transition relative ${
                  isSidebarOpen && activeSidebarTab === 'participants'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title="Daftar Peserta Rapat"
              >
                <Users className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {roomParticipants.length}
                </span>
              </button>

              {/* Leave Meeting button */}
              <button
                onClick={handleLeaveMeeting}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md"
                title="Keluar dari Rapat Virtual Ini"
              >
                <PhoneOff className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar Rapat</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Interactive In-Meeting Sidebar */}
        {isSidebarOpen && (
          <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-xl flex flex-col h-[560px] lg:h-[640px] overflow-hidden">
            {/* Sidebar Tabs Header */}
            <div className="bg-slate-900/90 border-b border-slate-800 p-2 flex items-center justify-between">
              <div className="flex items-center gap-1 flex-1">
                <button
                  onClick={() => setActiveSidebarTab('chat')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    activeSidebarTab === 'chat'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Obrolan
                </button>
                <button
                  onClick={() => setActiveSidebarTab('participants')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    activeSidebarTab === 'participants'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Peserta ({roomParticipants.length})
                </button>
                <button
                  onClick={() => setActiveSidebarTab('notes')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    activeSidebarTab === 'notes'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Notulensi
                </button>
                <button
                  onClick={() => setActiveSidebarTab('rooms')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    activeSidebarTab === 'rooms'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pod Ruang
                </button>
              </div>

              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-white ml-1"
                title="Tutup Panel Samping"
              >
                ✕
              </button>
            </div>

            {/* TAB 1: CHAT & DISKUSI VIRTUAL */}
            {activeSidebarTab === 'chat' && (
              <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden">
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
                  {messages.map((m) => {
                    const isMe = m.senderId === currentAsn.id;
                    if (m.isSystem) {
                      return (
                        <div
                          key={m.id}
                          className="bg-slate-900/90 text-slate-300 p-2 rounded-xl border border-slate-800 text-[11px] text-center italic"
                        >
                          {m.text}
                        </div>
                      );
                    }
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold text-[11px] text-slate-200">
                            {isMe ? 'Anda' : m.senderName}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {m.timestamp}
                          </span>
                        </div>
                        <div
                          className={`p-2.5 rounded-2xl max-w-[88%] leading-relaxed ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-br-xs'
                              : 'bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/80'
                          }`}
                        >
                          <p>{m.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick hashtags */}
                <div className="flex items-center gap-1.5 py-2 overflow-x-auto text-[10px]">
                  {['#Presensi3x', '#EvidenSKP', '#KurikulumPKN', '#SiPraja'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setInputChat((prev) => `${prev} ${tag}`.trim())}
                      className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 shrink-0"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={inputChat}
                    onChange={(e) => setInputChat(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                    placeholder="Kirim pesan ke semua peserta..."
                    className="flex-1 bg-slate-800 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-hidden focus:border-emerald-400 placeholder:text-slate-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputChat.trim()}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: PARTICIPANTS & PRESENCE */}
            {activeSidebarTab === 'participants' && (
              <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400 font-medium">Dalam Ruang: {roomParticipants.length} ASN</span>
                  <span className="text-emerald-400 font-mono text-[10px]">TERVERIFIKASI SPBE</span>
                </div>

                {roomParticipants.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-2 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={
                            p.fotoUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
                          }
                          alt={p.nama}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-white/20"
                        />
                        {activeSpeakerId === p.id && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-ping" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-white truncate max-w-[130px]">
                            {p.nama}
                          </span>
                          {p.id === currentAsn.id && (
                            <span className="text-[9px] px-1 bg-blue-500/20 text-blue-300 rounded font-semibold">
                              Anda
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          {p.statusHariIni === 'WFH' ? '🏡 WFH' : '🏢 WFO Balongsari'} • {p.jabatan}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {handQueue.includes(p.id) && (
                        <span className="p-1 rounded bg-amber-500/20 text-amber-300">
                          <Hand className="w-3 h-3" />
                        </span>
                      )}
                      <span className="p-1 rounded bg-slate-800 text-emerald-400">
                        <Mic className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleVerifyPresence}
                  className="w-full mt-3 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Validasi Seluruh Presensi Rapat</span>
                </button>
              </div>
            )}

            {/* TAB 3: MEETING MINUTES (NOTULENSI RAPAT) */}
            {activeSidebarTab === 'notes' && (
              <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Notulensi Rapat Real-Time</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">BPSDM-MINUTES</span>
                </div>

                <textarea
                  value={meetingMinutes}
                  onChange={(e) => setMeetingMinutes(e.target.value)}
                  className="flex-1 w-full bg-slate-900 text-slate-200 text-xs p-3 rounded-xl border border-slate-800 focus:outline-hidden focus:border-amber-400 mt-2 font-mono leading-relaxed resize-none"
                  placeholder="Ketik catatan dan notulensi rapat di sini..."
                />

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800 mt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(meetingMinutes);
                      alert('Notulensi berhasil disalin ke clipboard untuk dimasukkan ke Google Docs!');
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin ke Docs</span>
                  </button>

                  <button
                    onClick={() => {
                      const blob = new Blob([meetingMinutes], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Notulensi_Rapat_${activeRoom.id}_${new Date().toISOString().split('T')[0]}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh TXT</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: ROOM SWITCHER (PODS) */}
            {activeSidebarTab === 'rooms' && (
              <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                <span className="text-slate-400 block font-medium pb-2 border-b border-slate-800">
                  Pindah ke Pod / Ruang Lain:
                </span>
                {VIRTUAL_ROOMS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRoomId(r.id);
                      playJoinMeetingSound();
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                      selectedRoomId === r.id
                        ? 'bg-emerald-950/80 border-emerald-500 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span>{r.icon}</span>
                        <span className="truncate font-semibold">{r.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{r.subtitle}</p>
                    </div>

                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono shrink-0">
                      {r.participantCount} ASN
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
