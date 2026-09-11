import React, { useState, useEffect, useRef } from 'react';
import { 
  Crown, 
  Eye, 
  Radio, 
  Compass, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Video, 
  Send, 
  UserCheck, 
  Building2, 
  ShieldCheck, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  FileText, 
  ExternalLink, 
  Award, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  RefreshCw,
  Search,
  Users
} from 'lucide-react';
import { ASNProfile, DailyTask, PresensiRecord, UnitKerjaId } from '../types';
import { UNIT_KERJA_LIST } from '../data/mockData';

interface MetaverseMonitoringProps {
  allAsn: ASNProfile[];
  currentAsn: ASNProfile;
  dailyTasks: DailyTask[];
  presensiList: PresensiRecord[];
  onOpenWorkspaceModal?: () => void;
  onSendFeedbackToAsn?: (asnId: string, message: string) => void;
}

interface RoomZone {
  id: string;
  name: string;
  shortName: string;
  unitId?: UnitKerjaId;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  borderAccent: string;
  icon: string;
  description: string;
}

const ROOM_ZONES: RoomZone[] = [
  {
    id: 'ruang_kepala',
    name: 'Ruang Komando Eksekutif Kepala BPSDM',
    shortName: 'Ruang Pimpinan',
    x: 420,
    y: 80,
    width: 360,
    height: 240,
    color: '#0f172a',
    borderAccent: '#f59e0b',
    icon: '👑',
    description: 'Pusat komando strategis, meja kerja pimpinan, dan hologram statistik live Jawa Timur.'
  },
  {
    id: 'pk_manajerial',
    name: 'Bidang Pengembangan Kompetensi Manajerial',
    shortName: 'PK Manajerial',
    unitId: 'pk_manajerial',
    x: 60,
    y: 80,
    width: 320,
    height: 240,
    color: '#092520',
    borderAccent: '#10b981',
    icon: '🏛️',
    description: 'Penyelenggaraan PKN Tingkat II, PKA, PKP, dan Pelatihan Dasar CPNS Jawa Timur.'
  },
  {
    id: 'pk_teknis',
    name: 'Bidang Pengembangan Kompetensi Teknis & SPBE',
    shortName: 'PK Teknis',
    unitId: 'pk_teknis',
    x: 820,
    y: 80,
    width: 320,
    height: 240,
    color: '#0f2438',
    borderAccent: '#38bdf8',
    icon: '💻',
    description: 'Laboratorium digital aparatur, transformasi SPBE Jatim, dan keahlian teknis daerah.'
  },
  {
    id: 'pk_fungsional_soskul',
    name: 'Bidang PK Fungsional & Sosial Kultural',
    shortName: 'PK Fungsional',
    unitId: 'pk_fungsional_soskul',
    x: 60,
    y: 360,
    width: 320,
    height: 240,
    color: '#1a182d',
    borderAccent: '#a855f7',
    icon: '👥',
    description: 'Internalisasi Core Values ASN BerAKHLAK dan diklat fungsional perangkat daerah.'
  },
  {
    id: 'sekretariat',
    name: 'Sekretariat & Layanan Kepegawaian',
    shortName: 'Sekretariat',
    unitId: 'sekretariat',
    x: 820,
    y: 360,
    width: 320,
    height: 240,
    color: '#1e2430',
    borderAccent: '#64748b',
    icon: '📂',
    description: 'Tata usaha, persuratan digital, akuntabilitas keuangan, dan kepegawaian ASN.'
  },
  {
    id: 'auditorium_garuda',
    name: 'Auditorium Garuda Virtual BPSDM Jatim',
    shortName: 'Auditorium',
    x: 420,
    y: 360,
    width: 360,
    height: 240,
    color: '#161e2e',
    borderAccent: '#06b6d4',
    icon: '🎙️',
    description: 'Panggung apel virtual, seminar terbuka, dan pengarahan massal pimpinan.'
  },
  {
    id: 'upt_sertifikasi_sdm',
    name: 'UPT Sertifikasi Mutu SDM BPSDM Jatim',
    shortName: 'UPT Sertifikasi',
    unitId: 'upt_sertifikasi_sdm',
    x: 420,
    y: 630,
    width: 360,
    height: 200,
    color: '#241b12',
    borderAccent: '#d97706',
    icon: '🎖️',
    description: 'Uji kompetensi asesor, sertifikasi profesi aparatur, dan penjaminan mutu diklat.'
  }
];

export const MetaverseMonitoringSection: React.FC<MetaverseMonitoringProps> = ({
  allAsn,
  currentAsn,
  dailyTasks,
  presensiList,
  onOpenWorkspaceModal,
  onSendFeedbackToAsn
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Viewport / Camera State
  const [camera, setCamera] = useState<{ x: number; y: number; zoom: number }>({
    x: 100,
    y: 40,
    zoom: 0.9,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pimpinan Avatar Position
  const [leaderPos, setLeaderPos] = useState<{ x: number; y: number }>({ x: 600, y: 190 });
  const [targetLeaderPos, setTargetLeaderPos] = useState<{ x: number; y: number }>({ x: 600, y: 190 });

  // Mode & Lighting
  const [lightingMode, setLightingMode] = useState<'CYBER' | 'DAY'>('CYBER');
  const [isPatrolMode, setIsPatrolMode] = useState<boolean>(false);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(false);
  const [selectedAsn, setSelectedAsn] = useState<ASNProfile | null>(null);
  const [filterUnit, setFilterUnit] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Hologram Announcement
  const [activeBroadcast, setActiveBroadcast] = useState<string>(
    'ARAHAN KEPALA BPSDM: Seluruh ASN WFH & WFO Wajib Melakukan Presensi Tiga Kali Sehari Sesuai SE No. 800/1141/204/2026 dan Mengunggah Eviden Kinerja.'
  );
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);
  const [newBroadcastText, setNewBroadcastText] = useState<string>('');

  // Feedback note input in Sidak drawer
  const [feedbackNote, setFeedbackNote] = useState<string>('');
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Audio Context (Simple synthesized sci-fi chime)
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playChime = (freq: number = 440) => {
    if (!isSoundOn) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn('Audio play notice:', e);
    }
  };

  // Keyboard navigation for Leader avatar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      const step = 20;
      let dx = 0;
      let dy = 0;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dy -= step;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dy += step;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dx -= step;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dx += step;

      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        setTargetLeaderPos((prev) => ({
          x: Math.max(50, Math.min(1150, prev.x + dx)),
          y: Math.max(60, Math.min(850, prev.y + dy)),
        }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Smooth lerp leader position
  useEffect(() => {
    let animId: number;
    const updateMovement = () => {
      setLeaderPos((cur) => {
        const dx = targetLeaderPos.x - cur.x;
        const dy = targetLeaderPos.y - cur.y;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return targetLeaderPos;
        return {
          x: cur.x + dx * 0.15,
          y: cur.y + dy * 0.15,
        };
      });
      animId = requestAnimationFrame(updateMovement);
    };
    animId = requestAnimationFrame(updateMovement);
    return () => cancelAnimationFrame(animId);
  }, [targetLeaderPos]);

  // Auto-Patrol Drone Camera (optional)
  useEffect(() => {
    if (!isPatrolMode) return;
    const patrolZones = [
      { x: 420, y: 80 },
      { x: 60, y: 80 },
      { x: 60, y: 360 },
      { x: 420, y: 360 },
      { x: 820, y: 360 },
      { x: 820, y: 80 },
      { x: 420, y: 630 }
    ];
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % patrolZones.length;
      const target = patrolZones[currentIndex];
      setCamera((prev) => ({
        ...prev,
        x: -(target.x - 200),
        y: -(target.y - 120),
      }));
      playChime(600);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPatrolMode]);

  // Main Canvas Rendering Engine (60 FPS with requestAnimationFrame)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let tick = 0;

    const render = () => {
      tick++;
      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas Background
      if (lightingMode === 'CYBER') {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, width, height);

        // Cyber Grid Lines
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
        ctx.lineWidth = 1;
        const gridSize = 40 * camera.zoom;
        const offsetX = (camera.x * camera.zoom) % gridSize;
        const offsetY = (camera.y * camera.zoom) % gridSize;

        for (let x = offsetX; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = offsetY; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(203, 213, 225, 0.5)';
        ctx.lineWidth = 1;
        const gridSize = 40 * camera.zoom;
        const offsetX = (camera.x * camera.zoom) % gridSize;
        const offsetY = (camera.y * camera.zoom) % gridSize;

        for (let x = offsetX; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = offsetY; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      ctx.save();
      // Apply Camera Transform
      ctx.translate(camera.x * camera.zoom + width / 4, camera.y * camera.zoom + height / 4);
      ctx.scale(camera.zoom, camera.zoom);

      // 1. Draw Campus Walkway / Plazas Connecting Rooms
      ctx.fillStyle = lightingMode === 'CYBER' ? 'rgba(15, 23, 42, 0.7)' : '#e2e8f0';
      ctx.fillRect(40, 60, 1120, 800);

      // Central Corridor
      ctx.fillStyle = lightingMode === 'CYBER' ? 'rgba(6, 182, 212, 0.08)' : '#cbd5e1';
      ctx.fillRect(380, 60, 440, 800);
      ctx.fillRect(40, 320, 1120, 40);

      // 2. Draw Room Zones
      ROOM_ZONES.forEach((zone) => {
        // Room Base Floor
        ctx.fillStyle = zone.color;
        ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

        // Border Glow
        ctx.strokeStyle = zone.borderAccent;
        ctx.lineWidth = 2;
        ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);

        // Corner futuristic accents
        const cornerSize = 12;
        ctx.fillStyle = zone.borderAccent;
        ctx.fillRect(zone.x, zone.y, cornerSize, 3);
        ctx.fillRect(zone.x, zone.y, 3, cornerSize);
        ctx.fillRect(zone.x + zone.width - cornerSize, zone.y, cornerSize, 3);
        ctx.fillRect(zone.x + zone.width - 3, zone.y, 3, cornerSize);
        ctx.fillRect(zone.x, zone.y + zone.height - 3, cornerSize, 3);
        ctx.fillRect(zone.x, zone.y + zone.height - cornerSize, 3, cornerSize);
        ctx.fillRect(zone.x + zone.width - cornerSize, zone.y + zone.height - 3, cornerSize, 3);
        ctx.fillRect(zone.x + zone.width - 3, zone.y + zone.height - cornerSize, 3, cornerSize);

        // Zone Header Banner
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(zone.x, zone.y, zone.width, 32);

        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${zone.icon} ${zone.shortName}`, zone.x + 12, zone.y + 21);

        // Subtitle badge
        ctx.font = '10px system-ui, sans-serif';
        ctx.fillStyle = zone.borderAccent;
        ctx.fillText(zone.id === 'ruang_kepala' ? 'COMMAND HEADQUARTERS' : 'ZONA KINERJA BPSDM', zone.x + zone.width - 145, zone.y + 21);

        // Zone Internal Features (Desk Layouts)
        if (zone.id === 'ruang_kepala') {
          // Executive Command Desk
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.fillRect(zone.x + 100, zone.y + 110, 160, 60);
          ctx.strokeRect(zone.x + 100, zone.y + 110, 160, 60);

          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.fillText('MEJA KOMANDO KEPALA BPSDM', zone.x + 105, zone.y + 145);

          // Big Hologram Screen Floating on Top
          const pulse = Math.sin(tick * 0.05) * 4;
          ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
          ctx.lineWidth = 1.5;
          ctx.fillRect(zone.x + 70, zone.y + 45 + pulse, 220, 50);
          ctx.strokeRect(zone.x + 70, zone.y + 45 + pulse, 220, 50);

          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#fbbf24';
          ctx.fillText('HOLOGRAM MONITORING JAWA TIMUR', zone.x + 85, zone.y + 65 + pulse);
          ctx.font = '9px system-ui, sans-serif';
          ctx.fillStyle = '#e2e8f0';
          ctx.fillText(`ASN Terhubung: ${allAsn.length} Pegawai • SE 800/1141/204/2026`, zone.x + 80, zone.y + 82 + pulse);
        } else if (zone.id === 'auditorium_garuda') {
          // Stage & Podium
          ctx.fillStyle = '#0e7490';
          ctx.fillRect(zone.x + 60, zone.y + 45, 240, 45);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.fillText('PANGGUNG & PODIUM APEL VIRTUAL GARUDA', zone.x + 70, zone.y + 72);

          // Audience Chairs
          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 6; col++) {
              ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
              ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
              ctx.lineWidth = 1;
              const chairX = zone.x + 40 + col * 48;
              const chairY = zone.y + 115 + row * 38;
              ctx.fillRect(chairX, chairY, 32, 22);
              ctx.strokeRect(chairX, chairY, 32, 22);
            }
          }
        } else {
          // Standard Department Desks
          for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 3; c++) {
              const dx = zone.x + 25 + c * 95;
              const dy = zone.y + 55 + r * 85;
              ctx.fillStyle = lightingMode === 'CYBER' ? 'rgba(30, 41, 59, 0.8)' : '#cbd5e1';
              ctx.strokeStyle = zone.borderAccent;
              ctx.lineWidth = 1;
              ctx.fillRect(dx, dy, 75, 55);
              ctx.strokeRect(dx, dy, 75, 55);

              // Computer screen on desk
              ctx.fillStyle = zone.borderAccent;
              ctx.fillRect(dx + 25, dy + 8, 25, 14);
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(dx + 27, dy + 10, 21, 10);
            }
          }
        }
      });

      // 3. Draw ASN Staff Avatars in Their Assigned Zones
      allAsn.forEach((asn, idx) => {
        // Match ASN to a room zone
        const matchedZone = ROOM_ZONES.find((z) => z.unitId === asn.unitKerjaId) || ROOM_ZONES[1];

        // Pseudo-random but deterministic placement inside room
        const colIdx = idx % 3;
        const rowIdx = Math.floor((idx / 3) % 2);
        const avatarBaseX = matchedZone.x + 45 + colIdx * 95;
        const avatarBaseY = matchedZone.y + 90 + rowIdx * 85;

        // Micro-animation for breathing/working
        const bob = Math.sin((tick + idx * 20) * 0.08) * 2;
        const currentY = avatarBaseY + bob;

        // Is this avatar currently selected in Sidak?
        const isSelected = selectedAsn?.id === asn.id;

        // Status styling
        const isWfh = asn.statusHariIni === 'WFH';
        const isWfo = asn.statusHariIni === 'WFO';
        const isDl = asn.statusHariIni === 'DINAS_LUAR';

        // Avatar Hologram Ring (WFH gets cyan wave ring)
        if (isWfh) {
          ctx.save();
          ctx.strokeStyle = `rgba(6, 182, 212, ${0.4 + Math.sin(tick * 0.1) * 0.3})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(avatarBaseX, currentY, 18 + Math.sin(tick * 0.08) * 3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Selected Halo
        if (isSelected) {
          ctx.save();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(avatarBaseX, currentY, 22, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Avatar Body Circle
        ctx.beginPath();
        ctx.arc(avatarBaseX, currentY, 14, 0, Math.PI * 2);
        ctx.fillStyle = isWfh ? '#0891b2' : isWfo ? '#059669' : '#7c3aed';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#ffffff';
        ctx.stroke();

        // Initial in avatar
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initial = asn.nama.charAt(0);
        ctx.fillText(initial, avatarBaseX, currentY);

        // Name tag label
        ctx.font = '9px system-ui, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(avatarBaseX - 35, currentY + 16, 70, 14);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(avatarBaseX - 34, currentY + 17, 68, 12);
        ctx.fillStyle = '#f8fafc';
        const shortName = asn.nama.split(' ')[0] + (asn.nama.split(' ')[1] ? ` ${asn.nama.split(' ')[1].charAt(0)}.` : '');
        ctx.fillText(shortName, avatarBaseX, currentY + 23);

        // Mini status badge
        ctx.fillStyle = isWfh ? '#22d3ee' : isWfo ? '#34d399' : '#c084fc';
        ctx.beginPath();
        ctx.arc(avatarBaseX + 11, currentY - 11, 4.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Draw Kepala BPSDM Avatar (Player / Inspector Avatar)
      const isLeaderHead = currentAsn.role === 'KEPALA_BPSDM';
      ctx.save();
      // Glowing aura
      const auraPulse = Math.sin(tick * 0.1) * 4;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(leaderPos.x, leaderPos.y, 24 + auraPulse, 0, Math.PI * 2);
      ctx.stroke();

      // Body
      ctx.beginPath();
      ctx.arc(leaderPos.x, leaderPos.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#b45309';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();

      // Crown / Leader Symbol
      ctx.font = '14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👑', leaderPos.x, leaderPos.y);

      // Leader floating banner tag
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(leaderPos.x - 60, leaderPos.y - 36, 120, 16);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.strokeRect(leaderPos.x - 60, leaderPos.y - 36, 120, 16);

      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('KEPALA BPSDM JATIM', leaderPos.x, leaderPos.y - 28);
      ctx.restore();

      // 5. Draw Floating Hologram Marquee Banner across the Campus
      if (activeBroadcast) {
        ctx.save();
        const bannerY = 25;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(100, bannerY, 1000, 26);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(100, bannerY, 1000, 26);

        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'left';
        ctx.fillText('📡 PENGUMUMAN VIRTUAL PIMPINAN:', 115, bannerY + 17);

        ctx.font = '11px system-ui, sans-serif';
        ctx.fillStyle = '#ffffff';
        // Marquee scrolling offset
        const marqueeSpeed = 1.2;
        const marqueeWidth = 720;
        const textX = 350 - ((tick * marqueeSpeed) % (marqueeWidth + 600));
        ctx.fillText(activeBroadcast, textX, bannerY + 17);
        ctx.restore();
      }

      ctx.restore(); // Restore camera transform

      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrame);
  }, [camera, leaderPos, selectedAsn, allAsn, lightingMode, activeBroadcast, currentAsn]);

  // Click handler on Canvas: Inspect ASN or Move Leader Avatar
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickScreenX = e.clientX - rect.left;
    const clickScreenY = e.clientY - rect.top;

    // Convert Screen coordinates to World coordinates
    const worldX = (clickScreenX - canvas.width / 4) / camera.zoom - camera.x;
    const worldY = (clickScreenY - canvas.height / 4) / camera.zoom - camera.y;

    // Check if clicked near an ASN avatar
    let clickedAsn: ASNProfile | null = null;
    allAsn.forEach((asn, idx) => {
      const matchedZone = ROOM_ZONES.find((z) => z.unitId === asn.unitKerjaId) || ROOM_ZONES[1];
      const colIdx = idx % 3;
      const rowIdx = Math.floor((idx / 3) % 2);
      const avatarBaseX = matchedZone.x + 45 + colIdx * 95;
      const avatarBaseY = matchedZone.y + 90 + rowIdx * 85;

      const dist = Math.hypot(worldX - avatarBaseX, worldY - avatarBaseY);
      if (dist < 28) {
        clickedAsn = asn;
      }
    });

    if (clickedAsn) {
      setSelectedAsn(clickedAsn);
      playChime(550);
      return;
    }

    // Otherwise, move Kepala BPSDM avatar to clicked world coordinates
    setTargetLeaderPos({
      x: Math.max(50, Math.min(1150, worldX)),
      y: Math.max(60, Math.min(850, worldY)),
    });
    playChime(400);
  };

  // Drag-to-pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only pan on middle button or when pressing space or left button drag
    setIsDragging(true);
    setDragStart({ x: e.clientX - camera.x, y: e.clientY - camera.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setCamera((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom handlers
  const handleZoom = (delta: number) => {
    setCamera((prev) => ({
      ...prev,
      zoom: Math.max(0.5, Math.min(1.8, prev.zoom + delta)),
    }));
  };

  // Teleport helper for Kepala BPSDM
  const teleportToZone = (zoneId: string) => {
    const zone = ROOM_ZONES.find((z) => z.id === zoneId);
    if (!zone) return;
    setTargetLeaderPos({
      x: zone.x + zone.width / 2,
      y: zone.y + zone.height / 2,
    });
    setCamera({
      x: -(zone.x - 100),
      y: -(zone.y - 60),
      zoom: 1.0,
    });
    playChime(660);
  };

  // Filter ASN list
  const filteredAsnList = allAsn.filter((asn) => {
    const matchUnit = filterUnit === 'ALL' || asn.unitKerjaId === filterUnit;
    const matchQuery =
      searchQuery === '' ||
      asn.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asn.jabatan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchUnit && matchQuery;
  });

  // Calculate live statistics
  const totalWfh = allAsn.filter((a) => a.statusHariIni === 'WFH').length;
  const totalWfo = allAsn.filter((a) => a.statusHariIni === 'WFO').length;
  const totalDl = allAsn.filter((a) => a.statusHariIni === 'DINAS_LUAR').length;
  const percentageWfh = Math.round((totalWfh / allAsn.length) * 100);

  // Submit feedback note to ASN
  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsn || !feedbackNote.trim()) return;
    if (onSendFeedbackToAsn) {
      onSendFeedbackToAsn(selectedAsn.id, feedbackNote);
    }
    setFeedbackSuccess(`Arahan berhasil dipancarkan ke workstation ${selectedAsn.nama}.`);
    setFeedbackNote('');
    playChime(750);
    setTimeout(() => setFeedbackSuccess(null), 4000);
  };

  // Quick Random Sidak
  const handleRandomSidak = () => {
    if (allAsn.length === 0) return;
    const randomIdx = Math.floor(Math.random() * allAsn.length);
    const target = allAsn[randomIdx];
    setSelectedAsn(target);
    const matchedZone = ROOM_ZONES.find((z) => z.unitId === target.unitKerjaId) || ROOM_ZONES[1];
    setCamera({
      x: -(matchedZone.x - 100),
      y: -(matchedZone.y - 60),
      zoom: 1.1,
    });
    playChime(800);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Identity */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-white relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Ruang Metaverse Pemantauan Kepala BPSDM Jatim
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  3D DIGITAL TWIN
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulasi Kampus Virtual Balongsari Tama & Malang • Inspeksi WFA/WFH 100% SE No. 800/1141/204/2026
              </p>
            </div>
          </div>

          {/* Quick Stats Metrics */}
          <div className="grid grid-cols-4 gap-2 text-center w-full lg:w-auto">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5">
              <div className="text-[10px] text-slate-400">Total ASN</div>
              <div className="text-base font-bold text-white">{allAsn.length}</div>
            </div>
            <div className="bg-emerald-950/60 border border-emerald-800/60 rounded-xl px-3 py-1.5">
              <div className="text-[10px] text-emerald-400">WFO Kampus</div>
              <div className="text-base font-bold text-emerald-300">{totalWfo}</div>
            </div>
            <div className="bg-cyan-950/60 border border-cyan-800/60 rounded-xl px-3 py-1.5">
              <div className="text-[10px] text-cyan-400">WFH Digital</div>
              <div className="text-base font-bold text-cyan-300">{totalWfh} ({percentageWfh}%)</div>
            </div>
            <div className="bg-purple-950/60 border border-purple-800/60 rounded-xl px-3 py-1.5">
              <div className="text-[10px] text-purple-400">Dinas Luar</div>
              <div className="text-base font-bold text-purple-300">{totalDl}</div>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Teleport Quick Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              Teleport:
            </span>
            <button
              onClick={() => teleportToZone('ruang_kepala')}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium transition shrink-0"
            >
              👑 Ruang Pimpinan
            </button>
            <button
              onClick={() => teleportToZone('pk_manajerial')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition shrink-0"
            >
              🏛️ PK Manajerial
            </button>
            <button
              onClick={() => teleportToZone('pk_teknis')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition shrink-0"
            >
              💻 PK Teknis & SPBE
            </button>
            <button
              onClick={() => teleportToZone('pk_fungsional_soskul')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition shrink-0"
            >
              👥 Soskul BerAKHLAK
            </button>
            <button
              onClick={() => teleportToZone('sekretariat')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition shrink-0"
            >
              📂 Sekretariat
            </button>
            <button
              onClick={() => teleportToZone('auditorium_garuda')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition shrink-0"
            >
              🎙️ Auditorium Garuda
            </button>
            <button
              onClick={() => teleportToZone('upt_sertifikasi_sdm')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition shrink-0"
            >
              🎖️ UPT Sertifikasi
            </button>
          </div>

          {/* Interactive Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomSidak}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition flex items-center gap-1.5 shadow-xs"
              title="Inspeksi mendadak ke salah satu workstation staf ASN secara acak"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Sidak Acak ASN</span>
            </button>

            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center gap-1.5 shadow-xs"
              title="Pancarkan arahan resmi Kepala BPSDM ke seluruh ruangan Metaverse"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Broadcast Pimpinan</span>
            </button>

            <button
              onClick={() => setIsPatrolMode(!isPatrolMode)}
              className={`px-3 py-1 rounded-lg border font-medium transition flex items-center gap-1.5 ${
                isPatrolMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Kamera otomatis berpatroli mengelilingi seluruh ruangan bidang"
            >
              <Video className="w-3.5 h-3.5" />
              <span>{isPatrolMode ? 'Patroli Aktif' : 'Drone Patroli'}</span>
            </button>

            <button
              onClick={() => setLightingMode(lightingMode === 'CYBER' ? 'DAY' : 'CYBER')}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title={lightingMode === 'CYBER' ? 'Ubah ke Mode Siang Surabaya' : 'Ubah ke Mode Cyber Metaverse'}
            >
              {lightingMode === 'CYBER' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
            </button>

            <button
              onClick={() => setIsSoundOn(!isSoundOn)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title={isSoundOn ? 'Matikan Suara Ambien' : 'Aktifkan Suara Ambien Futuristik'}
            >
              {isSoundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Metaverse Canvas & Sidak Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center: Interactive 3D Metaverse Canvas */}
        <div className="lg:col-span-8 space-y-3">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Canvas Viewport */}
            <canvas
              ref={canvasRef}
              width={1000}
              height={620}
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-[520px] sm:h-[580px] cursor-crosshair block select-none"
            />

            {/* In-Canvas Floating Controls */}
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl p-1.5 backdrop-blur-md text-white text-xs">
              <button
                onClick={() => handleZoom(0.15)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-bold text-slate-200 transition"
                title="Perbesar Tampilan"
              >
                +
              </button>
              <button
                onClick={() => handleZoom(-0.15)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-bold text-slate-200 transition"
                title="Perkecil Tampilan"
              >
                -
              </button>
              <button
                onClick={() => setCamera({ x: 100, y: 40, zoom: 0.9 })}
                className="px-2 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-[11px] text-slate-300 font-medium transition"
                title="Reset Posisi Kamera"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Reset
              </button>
            </div>

            {/* Instruction Badge */}
            <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-400 backdrop-blur-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Gunakan Tombol W-A-S-D untuk jalan • Klik avatar staf untuk sidak kinerja</span>
            </div>

            {/* Mini Map in Bottom Right */}
            <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-700 rounded-xl p-2 hidden sm:block backdrop-blur-md">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Radar Kampus</span>
                <span className="text-emerald-400 text-[8px]">LIVE 60FPS</span>
              </div>
              <div className="w-28 h-20 bg-slate-950 border border-slate-800 rounded relative overflow-hidden">
                {/* Simplified Mini-Room dots */}
                {ROOM_ZONES.map((z) => (
                  <div
                    key={z.id}
                    onClick={() => teleportToZone(z.id)}
                    className="absolute rounded-xs cursor-pointer hover:opacity-100 opacity-60 transition"
                    style={{
                      left: `${(z.x / 1200) * 100}%`,
                      top: `${(z.y / 900) * 100}%`,
                      width: `${(z.width / 1200) * 100}%`,
                      height: `${(z.height / 900) * 100}%`,
                      backgroundColor: z.borderAccent,
                    }}
                    title={z.name}
                  />
                ))}
                {/* Leader Blip */}
                <div
                  className="absolute w-2 h-2 rounded-full bg-amber-400 border border-white -translate-x-1 -translate-y-1 animate-ping"
                  style={{
                    left: `${(leaderPos.x / 1200) * 100}%`,
                    top: `${(leaderPos.y / 900) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Hint Banner */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Tip Pimpinan:</strong> Klik meja komando di Ruang Pimpinan untuk kembali ke posisi utama atau gunakan tombol W-A-S-D untuk berkeliling kampus.
              </span>
            </div>
            {onOpenWorkspaceModal && (
              <button
                onClick={onOpenWorkspaceModal}
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 shrink-0"
              >
                <span>Buka Google Meet</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Sidak Virtual ASN Panel & Roster Filter */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected ASN Sidak Card */}
          {selectedAsn ? (
            <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl p-5 text-white shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {selectedAsn.fotoUrl ? (
                      <img
                        src={selectedAsn.fotoUrl}
                        alt={selectedAsn.nama}
                        className="w-13 h-13 rounded-xl object-cover border-2 border-amber-400"
                      />
                    ) : (
                      <div className="w-13 h-13 rounded-xl bg-slate-800 border-2 border-amber-400 flex items-center justify-center font-bold text-amber-400 text-lg">
                        {selectedAsn.nama.charAt(0)}
                      </div>
                    )}
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                        selectedAsn.statusHariIni === 'WFH'
                          ? 'bg-cyan-400'
                          : selectedAsn.statusHariIni === 'WFO'
                          ? 'bg-emerald-400'
                          : 'bg-purple-400'
                      }`}
                      title={selectedAsn.statusHariIni}
                    />
                  </div>
                  <div>
                    <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>HASIL SIDAK VIRTUAL PIMPINAN</span>
                    </div>
                    <h3 className="font-bold text-white text-base leading-tight mt-0.5">
                      {selectedAsn.nama}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedAsn.jabatan}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAsn(null)}
                  className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 bg-slate-800 rounded-lg"
                >
                  Tutup
                </button>
              </div>

              {/* Status & Work Location */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5">
                  <div className="text-[10px] text-slate-400">Status Hari Ini</div>
                  <div className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedAsn.statusHariIni === 'WFH' ? 'bg-cyan-400' : 'bg-emerald-400'
                      }`}
                    />
                    <span>{selectedAsn.statusHariIni}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({selectedAsn.statusHariIni === 'WFH' ? 'Bekerja Dari Rumah' : 'Kampus Balongsari'})
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5">
                  <div className="text-[10px] text-slate-400">NIP / Golongan</div>
                  <div className="font-mono text-[11px] text-slate-200 mt-0.5 truncate">
                    {selectedAsn.nip}
                  </div>
                  <div className="text-[10px] text-amber-400">{selectedAsn.pangkatGolongan}</div>
                </div>
              </div>

              {/* Active Daily Task / Rencana Kinerja */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    Tugas Harian Hari Ini:
                  </span>
                  {dailyTasks.find((t) => t.asnId === selectedAsn.id) && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      TERCATAT
                    </span>
                  )}
                </div>

                {(() => {
                  const activeTask = dailyTasks.find((t) => t.asnId === selectedAsn.id);
                  if (activeTask) {
                    return (
                      <div className="space-y-1.5 text-xs text-slate-300">
                        <div className="font-medium text-white">{activeTask.judulTugas}</div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Target: {activeTask.targetKuantitas} {activeTask.satuan}</span>
                          <span className="text-emerald-400 font-semibold">Progres: {activeTask.progres}%</span>
                        </div>
                        {activeTask.evidenceUrl && (
                          <a
                            href={activeTask.evidenceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline pt-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Lihat Eviden Kinerja di Google Drive</span>
                          </a>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div className="text-xs text-slate-400 italic">
                      Pegawai ini belum mendaftarkan tugas harian baru untuk hari ini.
                    </div>
                  );
                })()}
              </div>

              {/* Presensi Check */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5">
                <div className="font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    Presensi 3x Sehari (SE 800/1141/204/2026):
                  </span>
                </div>
                {(() => {
                  const presensiRecords = presensiList.filter((p) => p.asnId === selectedAsn.id);
                  if (presensiRecords.length > 0) {
                    return (
                      <div className="space-y-1 text-[11px]">
                        {presensiRecords.map((rec) => (
                          <div key={rec.id} className="flex items-center justify-between text-slate-300 border-b border-slate-800/60 pb-1">
                            <span className="font-semibold text-emerald-400">Presensi {rec.tipe}</span>
                            <span className="font-mono text-slate-400">{rec.jam} WIB</span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[110px]">{rec.statusGeolokasi.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return (
                    <div className="text-xs text-slate-400 italic">
                      Belum ada catatan presensi hari ini.
                    </div>
                  );
                })()}
              </div>

              {/* Action: Send Arahan Pimpinan to ASN */}
              <form onSubmit={handleSendFeedback} className="space-y-2 pt-1 border-t border-slate-800">
                <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                  Kirim Catatan / Arahan Pimpinan:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    placeholder="Contoh: Percepat dokumen eviden modul PKN II..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim</span>
                  </button>
                </div>
                {feedbackSuccess && (
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{feedbackSuccess}</span>
                  </div>
                )}
              </form>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center text-slate-400 shadow-xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-amber-400">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-sm">Mode Inspeksi Pimpinan BPSDM</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pilih atau klik avatar pegawai ASN mana pun di kanvas 3D untuk melakukan sidak virtual luaran kinerja, verifikasi presensi 3x sehari, atau mengirimkan catatan pengarahan.
              </p>
              <button
                onClick={handleRandomSidak}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Pilih Staf Acak untuk Sidak</span>
              </button>
            </div>
          )}

          {/* Roster Filter & List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl text-white space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Roster Pegawai di Metaverse ({filteredAsnList.length})</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">SE 800/1141/204/2026</span>
            </div>

            {/* Filter controls */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama atau jabatan..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={filterUnit}
                onChange={(e) => setFilterUnit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">Semua Bidang & UPT</option>
                {UNIT_KERJA_LIST.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.singkatan}
                  </option>
                ))}
              </select>
            </div>

            {/* Scrollable list of ASN */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {filteredAsnList.map((asn) => {
                const isSelected = selectedAsn?.id === asn.id;
                return (
                  <div
                    key={asn.id}
                    onClick={() => {
                      setSelectedAsn(asn);
                      playChime(600);
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition border ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/60 text-white'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          asn.statusHariIni === 'WFH'
                            ? 'bg-cyan-400'
                            : asn.statusHariIni === 'WFO'
                            ? 'bg-emerald-400'
                            : 'bg-purple-400'
                        }`}
                      />
                      <div className="truncate">
                        <div className="font-medium truncate">{asn.nama}</div>
                        <div className="text-[10px] text-slate-400 truncate">{asn.jabatan}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-bold shrink-0 ${
                        asn.statusHariIni === 'WFH'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {asn.statusHariIni}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Broadcast Modal for Kepala BPSDM */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Pancarkan Arahan Hologram Kepala BPSDM</h3>
                  <p className="text-[11px] text-slate-400">Pesan akan melayang di kanvas 3D seluruh ruangan</p>
                </div>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Pilih Templat Arahan Cepat:</label>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setNewBroadcastText('Peringatan: Seluruh ASN WFH & WFO wajib menyelesaikan presensi siang (12:00 - 13:00 WIB) sesuai SE 800/1141/204/2026.')}
                  className="p-2 text-left rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
                >
                  ⏰ Batas Presensi Siang 12:00 - 13:00 WIB
                </button>
                <button
                  type="button"
                  onClick={() => setNewBroadcastText('Kepala BPSDM Mengingatkan: Unggah bukti luaran kinerja harian di Google Drive sebelum jam 16:00 WIB.')}
                  className="p-2 text-left rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
                >
                  📂 Unggah Eviden Kinerja Harian Drive
                </button>
                <button
                  type="button"
                  onClick={() => setNewBroadcastText('Pengarahan: Rapat virtual koordinasi PKN II dan PKA akan dimulai pukul 14:00 WIB melalui Google Meet BPSDM.')}
                  className="p-2 text-left rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
                >
                  🏛️ Rapat Koordinasi Diklat Manajerial (Meet)
                </button>
                <button
                  type="button"
                  onClick={() => setNewBroadcastText('ASN BPSDM Jatim BerAKHLAK: Bangga Melayani Bangsa, Optimis Jatim Bangkit dan Profesional.')}
                  className="p-2 text-left rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
                >
                  🌟 Core Values BerAKHLAK & Semangat Jatim
                </button>
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Atau Tulis Arahan Khusus:</label>
              <textarea
                rows={3}
                value={newBroadcastText}
                onChange={(e) => setNewBroadcastText(e.target.value)}
                placeholder="Tuliskan arahan resmi pimpinan..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newBroadcastText.trim()) {
                    setActiveBroadcast(`ARAHAN KEPALA BPSDM: ${newBroadcastText.trim()}`);
                    playChime(880);
                    setIsBroadcastModalOpen(false);
                    setNewBroadcastText('');
                  }
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Pancarkan ke Metaverse</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
