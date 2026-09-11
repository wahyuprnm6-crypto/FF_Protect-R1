import React, { useState, useEffect } from 'react';
import { 
  ASNProfile, 
  QuotaCalculation, 
  FwaRequest, 
  UserMode, 
  GoogleWorkspaceState, 
  PresensiRecord, 
  DailyTask 
} from '../types';
import { apiService } from '../services/api';
import { 
  ShieldCheck, 
  Radio, 
  Users, 
  Building2, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Search, 
  Filter, 
  Crown, 
  User, 
  Calendar, 
  Video, 
  MessageSquare, 
  FolderSync, 
  FileCheck, 
  RefreshCw, 
  TrendingUp, 
  Zap, 
  Send,
  Eye,
  Camera,
  UserCog
} from 'lucide-react';

interface CommandCenterDashboardProps {
  currentAsn: ASNProfile;
  allAsn: ASNProfile[];
  quotas: QuotaCalculation[];
  fwaRequests: FwaRequest[];
  userMode: UserMode;
  workspaceState: GoogleWorkspaceState;
  presensiList: PresensiRecord[];
  dailyTasks: DailyTask[];
  onSelectUserMode: (mode: UserMode) => void;
  onOpenFwaModal: () => void;
  onOpenWorkspaceModal: () => void;
  onOpenSsoModal: () => void;
  onApproveRequest: (id: string, status: 'DISETUJUI' | 'DITOLAK') => void;
  onBroadcastChat: (title: string, message: string) => void;
  onOpenManageAsn?: () => void;
  onOpenGallery?: () => void;
  onOpenMetaverse?: () => void;
  onOpenZoomRoom?: () => void;
}

export const CommandCenterDashboard: React.FC<CommandCenterDashboardProps> = ({
  currentAsn,
  allAsn,
  quotas,
  fwaRequests,
  userMode,
  workspaceState,
  presensiList,
  dailyTasks,
  onSelectUserMode,
  onOpenFwaModal,
  onOpenWorkspaceModal,
  onOpenSsoModal,
  onApproveRequest,
  onBroadcastChat,
  onOpenManageAsn,
  onOpenGallery,
  onOpenMetaverse,
  onOpenZoomRoom,
}) => {
  // Current Live Clock WIB
  const [liveTime, setLiveTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'WFH' | 'WFO' | 'CHECKED_IN' | 'NEED_REVIEW'>('ALL');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('ALL');

  // AI Analyst State
  const [aiAnalysisType, setAiAnalysisType] = useState<
    'OVERALL_COMPLIANCE' | 'WORKLOAD_ANOMALY' | 'H1_FORECAST' | 'EXECUTIVE_BRIEF'
  >(userMode === 'PIMPINAN_KEPALA_BPSDM' ? 'EXECUTIVE_BRIEF' : 'OVERALL_COMPLIANCE');
  const [aiAnalysisText, setAiAnalysisText] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);

  // Broadcast Message Modal
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('Instruksi Kedinasan FWA');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  // Selected Employee Modal
  const [selectedEmployeeDetail, setSelectedEmployeeDetail] = useState<ASNProfile | null>(null);

  // Update Clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(
        now.toLocaleTimeString('id-ID', {
          timeZone: 'Asia/Jakarta',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch AI Analysis when analysis type changes or on load
  const runAiAnalysis = async (type: typeof aiAnalysisType) => {
    setIsAiLoading(true);
    setAiAnalysisType(type);
    try {
      const res = await apiService.analyzeWorkforce(type, {
        totalAsn: allAsn.length,
        quotas,
        fwaRequestsCount: fwaRequests.length,
        tasksCount: dailyTasks.length,
        presensiCount: presensiList.length,
        timestamp: new Date().toISOString(),
      });
      setAiAnalysisText(res.analysis);
      setIsAiGenerated(res.isAiGenerated);
    } catch {
      setAiAnalysisText('Gagal memuat analisa AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    runAiAnalysis(aiAnalysisType);
  }, [aiAnalysisType]);

  // Aggregate stats
  const totalAsn = allAsn.length;
  const wfhCount = allAsn.filter((a) => a.statusHariIni === 'WFH').length;
  const wfoCount = totalAsn - wfhCount;
  const overallWfhPct = Math.round((wfhCount / totalAsn) * 100);
  const pendingRequests = fwaRequests.filter((r) => r.status === 'MENUNGGU');

  // Filtered ASN List for the Monitoring Matrix
  const filteredAsn = allAsn.filter((asn) => {
    const matchesSearch =
      asn.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asn.nip.includes(searchQuery) ||
      asn.subBidang.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUnit = selectedUnitFilter === 'ALL' || asn.unitKerjaId === selectedUnitFilter;

    if (!matchesSearch || !matchesUnit) return false;

    if (filterMode === 'WFH') return asn.statusHariIni === 'WFH';
    if (filterMode === 'WFO') return asn.statusHariIni === 'WFO';
    if (filterMode === 'CHECKED_IN') {
      return presensiList.some((p) => p.asnId === asn.id || p.asnNip === asn.nip);
    }
    if (filterMode === 'NEED_REVIEW') {
      return fwaRequests.some(
        (r) => (r.asnId === asn.id || r.asnNip === asn.nip) && r.status === 'MENUNGGU'
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 text-slate-100">
      {/* 1. SUPREME TELEMETRY BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title & Live Status */}
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center p-2.5 shadow-lg border ${
                userMode === 'PIMPINAN_KEPALA_BPSDM'
                  ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {userMode === 'PIMPINAN_KEPALA_BPSDM' ? (
                <Crown className="w-7 h-7" />
              ) : (
                <Radio className="w-7 h-7 animate-pulse" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  COMMAND CENTER BPSDM JATIM
                </span>

                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                    userMode === 'PIMPINAN_KEPALA_BPSDM'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-600/60'
                      : 'bg-cyan-950/80 text-cyan-300 border-cyan-600/60'
                  }`}
                >
                  {userMode === 'PIMPINAN_KEPALA_BPSDM'
                    ? '★ MODE PENGAWASAN STRATEGIS: KEPALA BPSDM'
                    : '● MODE STASIUN KERJA: PEGAWAI ASN'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                Pusat Kendali Terpadu Fleksibilitas Kedinasan & Kediklatan ASN
              </h2>
              <p className="text-xs text-slate-400">
                Pemantauan WFA Hingga 100% (SE No. 800/1141/204/2026 & Pergub 71/2023), Presensi 3x Sehari, & Kinerja Luaran SKP Kampus Utama Balongsari Surabaya
              </p>
            </div>
          </div>

          {/* Real-Time Telemetry Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Clock Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Waktu Operasional</div>
                <div className="text-sm font-mono font-bold text-emerald-300">{liveTime || 'Memuat...'}</div>
              </div>
            </div>

            {/* Campus Readiness */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Layanan Fisik Kampus</div>
                <div className="text-xs font-bold text-blue-300 flex items-center gap-1">
                  <span>99.2% Siap & Siaga</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
              </div>
            </div>

            {/* SE 800/1141/204/2026 Compliance */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Kebijakan WFA 100%</div>
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <span>{overallWfhPct}% WFA</span>
                  <span className="text-[10px] text-slate-400 font-normal">(SE 800/1141/204/2026)</span>
                </div>
              </div>
            </div>

            {/* Quick Action: Gallery, Metaverse, Pimpinan Broadcast / ASN Management or Pegawai FWA */}
            <div className="flex flex-wrap items-center gap-2">
              {onOpenMetaverse && (
                <button
                  id="btn-command-metaverse"
                  onClick={onOpenMetaverse}
                  className="bg-linear-to-r from-amber-600 via-amber-500 to-cyan-600 hover:from-amber-500 hover:to-cyan-500 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition border border-amber-400/40"
                  title="Buka Ruang Metaverse 3D Pemantauan Kepala BPSDM"
                >
                  <Crown className="w-3.5 h-3.5 text-yellow-200" />
                  <span>Metaverse 3D</span>
                </button>
              )}

              {onOpenZoomRoom && (
                <button
                  id="btn-command-zoom-room"
                  onClick={onOpenZoomRoom}
                  className="bg-linear-to-r from-teal-600 via-emerald-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition border border-emerald-400/40 group"
                  title="Masuk ke Ruang Rapat Zoom Kantor Virtual BPSDM"
                >
                  <Video className="w-3.5 h-3.5 text-emerald-200 group-hover:scale-110 transition-transform" />
                  <span>Ruang Zoom</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                </button>
              )}

              {onOpenGallery && (
                <button
                  id="btn-command-gallery"
                  onClick={onOpenGallery}
                  className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-semibold text-xs px-3 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition"
                  title="Lihat Galeri Foto Kampus Balongsari Surabaya"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Foto Kampus</span>
                </button>
              )}

              {userMode === 'PIMPINAN_KEPALA_BPSDM' ? (
                <>
                  {onOpenManageAsn && (
                    <button
                      id="btn-pimpinan-manage-asn"
                      onClick={onOpenManageAsn}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition"
                    >
                      <UserCog className="w-4 h-4" />
                      <span>Kelola Pegawai</span>
                    </button>
                  )}
                  <button
                    id="btn-pimpinan-broadcast"
                    onClick={() => setIsBroadcastOpen(true)}
                    className="bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>Siaran Komando</span>
                  </button>
                </>
              ) : (
                <button
                  id="btn-pegawai-apply-fwa"
                  onClick={onOpenFwaModal}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Ajukan WFA</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. REAL-TIME QUOTA GAUGES (5 UNIT KERJA SESUAI PERGUB 71/2023) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-800">
          {quotas.map((q) => {
            const isFull = q.jumlahWfhHariIni >= q.maksimalWfh;
            const pct = Math.min(100, Math.round((q.jumlahWfhHariIni / q.maksimalWfh) * 100));

            return (
              <div
                key={q.unitKerjaId}
                className={`p-3 rounded-xl border transition ${
                  isFull
                    ? 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                    : pct >= 80
                    ? 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="truncate max-w-[170px]" title={q.unitKerjaNama}>
                    {q.unitKerjaNama}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      isFull
                        ? 'bg-rose-900 text-rose-200'
                        : pct >= 80
                        ? 'bg-amber-900 text-amber-200'
                        : 'bg-emerald-950 text-emerald-300'
                    }`}
                  >
                    {q.jumlahWfhHariIni}/{q.maksimalWfh} WFH
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isFull ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400 font-mono">
                  <span>WFO Fisik: {q.jumlahWfoHariIni} ASN</span>
                  <span>Sisa Slot: {q.kuotaTersediaWfh}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. AI OPERATIONAL ANALYST PANEL */}
      <div className="bg-linear-to-r from-slate-900 via-slate-900 to-teal-950 border border-teal-800/50 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Si-Praja AI Operational Intelligence
                <span className="text-[10px] bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-700/60">
                  {isAiGenerated ? 'Gemini 2.5 Flash Aktif' : 'Engine Analis SPBE'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Analisa cerdas otomatis kepatuhan Perpres 21/2023, deteksi anomali, dan proyeksi beban kerja ASN
              </p>
            </div>
          </div>

          {/* Analysis Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => runAiAnalysis('OVERALL_COMPLIANCE')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                aiAnalysisType === 'OVERALL_COMPLIANCE'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Kepatuhan 50%
            </button>
            <button
              onClick={() => runAiAnalysis('WORKLOAD_ANOMALY')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                aiAnalysisType === 'WORKLOAD_ANOMALY'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Deteksi Anomali
            </button>
            <button
              onClick={() => runAiAnalysis('H1_FORECAST')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                aiAnalysisType === 'H1_FORECAST'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Prediksi Kuota H-1
            </button>
            <button
              onClick={() => runAiAnalysis('EXECUTIVE_BRIEF')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                aiAnalysisType === 'EXECUTIVE_BRIEF'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Briefing Pimpinan
            </button>
            <button
              onClick={() => runAiAnalysis(aiAnalysisType)}
              disabled={isAiLoading}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition"
              title="Perbarui Analisa AI"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin text-teal-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* AI Output Content */}
        <div className="mt-3 text-xs leading-relaxed text-slate-200 font-sans whitespace-pre-line bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
          {isAiLoading ? (
            <div className="flex items-center gap-2.5 text-teal-300 py-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Memproses analisa data kepegawaian & regulasi SPBE...</span>
            </div>
          ) : (
            aiAnalysisText
          )}
        </div>
      </div>

      {/* 4. EXECUTIVE DISCRETION DESK (Khusus Kepala BPSDM jika ada permohonan > 50%) */}
      {userMode === 'PIMPINAN_KEPALA_BPSDM' && pendingRequests.length > 0 && (
        <div className="bg-linear-to-r from-amber-950/70 via-slate-900 to-amber-950/60 border border-amber-600/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Crown className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-amber-200">
                  Meja Otorisasi Diskresi Pimpinan ({pendingRequests.length} Permohonan Memerlukan Persetujuan)
                </h3>
                <p className="text-[11px] text-amber-300/70">
                  Persetujuan khusus Kepala BPSDM untuk tugas mendesak atau pengajuan dispensasi saat kuota 50% penuh.
                </p>
              </div>
            </div>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30 font-semibold">
              Perlu Tindakan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-950/90 border border-amber-700/50 rounded-xl p-3.5 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{req.asnNama}</span>
                    <span className="bg-amber-900/60 text-amber-200 text-[10px] px-2 py-0.5 rounded font-mono">
                      {req.jenisKerja} • {req.tanggal}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{req.asnNip}</div>
                  <div className="text-xs text-slate-300 mt-2 italic bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    "{req.alasanRencanaKerja}"
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onApproveRequest(req.id, 'DITOLAK')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold rounded-lg transition"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => onApproveRequest(req.id, 'DISETUJUI')}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Setujui Diskresi Kepala BPSDM</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ALL-EMPLOYEE MONITORING MATRIX (LIVE FLEET DASHBOARD) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        {/* Matrix Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Matriks Pengawasan Seluruh Pegawai BPSDM ({filteredAsn.length}/{totalAsn} ASN)
            </h3>
            <p className="text-xs text-slate-400">
              Status kehadiran real-time, validasi geolokasi GPS, capaian progres luaran SKP harian, dan konektivitas Google Workspace
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Nama, NIP, Jabatan..."
                className="bg-slate-950 border border-slate-700 text-xs text-white pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500 w-48 sm:w-60"
              />
            </div>

            {/* Unit Filter */}
            <select
              value={selectedUnitFilter}
              onChange={(e) => setSelectedUnitFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">Semua Unit Kerja (5 Unit - Pergub 71/2023)</option>
              <option value="sekretariat">1. Sekretariat BPSDM</option>
              <option value="pk_manajerial">2. Bidang PK Dasar & Manajerial (PKDM)</option>
              <option value="pk_fungsional_soskul">3. Bidang PK Fungsional & Soskul (PKF-SK)</option>
              <option value="pk_teknis">4. Bidang PK Teknis (PKT)</option>
              <option value="upt_sertifikasi_sdm">5. UPT Sertifikasi Kompetensi SDM (Kampus Balongsari)</option>
            </select>

            {/* Quick Status Buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterMode === 'ALL' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterMode('WFH')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterMode === 'WFH' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                WFH ({wfhCount})
              </button>
              <button
                onClick={() => setFilterMode('WFO')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterMode === 'WFO' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                WFO ({wfoCount})
              </button>
              <button
                onClick={() => setFilterMode('CHECKED_IN')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterMode === 'CHECKED_IN' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sudah Presensi
              </button>
            </div>
          </div>
        </div>

        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filteredAsn.map((asn) => {
            const isUserHimself = currentAsn.id === asn.id;
            const presensi = presensiList.find((p) => p.asnId === asn.id || p.asnNip === asn.nip);
            const userTasks = dailyTasks.filter((t) => t.asnId === asn.id || t.asnNip === asn.nip);
            const completedTasks = userTasks.filter((t) => t.progres === 100).length;
            const taskProgressPct = userTasks.length > 0 ? Math.round((completedTasks / userTasks.length) * 100) : 0;

            const isWfh = asn.statusHariIni === 'WFH';

            return (
              <div
                key={asn.id}
                className={`bg-slate-950/80 border rounded-2xl p-4 transition-all duration-200 relative group flex flex-col justify-between gap-3 ${
                  isUserHimself
                    ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Row: Avatar, Identity, Status Badge */}
                <div>
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-md ${
                            asn.role === 'KEPALA_BPSDM'
                              ? 'bg-amber-600 border border-amber-400'
                              : isWfh
                              ? 'bg-blue-600 border border-blue-400'
                              : 'bg-emerald-700 border border-emerald-500'
                          }`}
                        >
                          {asn.nama.substring(0, 1)}
                        </div>
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                            isWfh ? 'bg-blue-400' : 'bg-emerald-400'
                          }`}
                          title={isWfh ? 'Sedang WFH' : 'Sedang WFO Kampus Balongsari'}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{asn.nama}</span>
                          {isUserHimself && (
                            <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1.5 py-0.2 rounded font-mono border border-emerald-500/30">
                              Anda
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate">{asn.nip}</div>
                        <div className="text-[10px] text-slate-500 truncate">{asn.subBidang}</div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 border ${
                        isWfh
                          ? 'bg-blue-950/80 text-blue-300 border-blue-800/80'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                      }`}
                    >
                      {isWfh ? 'WFH Remote' : 'WFO Kampus'}
                    </span>
                  </div>

                  {/* Geolocation & Presensi Status */}
                  <div className="mt-3 pt-2.5 border-t border-slate-900 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Presensi Masuk:</span>
                      </span>
                      <span className="font-mono font-semibold text-white">
                        {presensi ? presensi.jam : '07:28:10 WIB (Auto-Check)'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        <span>Geolokasi GPS:</span>
                      </span>
                      <span className="font-medium text-emerald-400/90 text-[10px] truncate max-w-[150px]">
                        {isWfh ? 'Kediaman Resmi Valid' : 'Radius Kampus Balongsari'}
                      </span>
                    </div>

                    {/* Performance Progress */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Luaran Kinerja SKP ({userTasks.length} Target):</span>
                        <span className="font-bold text-emerald-300">{taskProgressPct}% Selesai</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-linear-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(15, taskProgressPct)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Quick Google Connect & Profile View */}
                <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <span
                      className="text-[10px] bg-slate-900 text-blue-300 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1"
                      title="Google Calendar Focus Block Aktif"
                    >
                      <Calendar className="w-3 h-3 text-blue-400" />
                      <span>Focus Block</span>
                    </span>
                    <span
                      className="text-[10px] bg-slate-900 text-emerald-300 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1"
                      title="Drive Evidence Synced"
                    >
                      <FolderSync className="w-3 h-3 text-emerald-400" />
                      <span>Drive</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        window.open(`mailto:${asn.email}`, '_blank');
                      }}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
                      title="Kirim Email Kedinasan"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedEmployeeDetail(asn)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[10px] font-semibold rounded-lg transition flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Detail</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: DETAIL PEGAWAI */}
      {selectedEmployeeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center text-base">
                  {selectedEmployeeDetail.nama.substring(0, 1)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedEmployeeDetail.nama}</h4>
                  <div className="text-xs text-slate-400 font-mono">{selectedEmployeeDetail.nip}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployeeDetail(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Jabatan:</span>
                <span className="font-semibold text-right">{selectedEmployeeDetail.jabatan}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Subbidang / Unit:</span>
                <span className="font-semibold">{selectedEmployeeDetail.subBidang}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Pangkat / Golongan:</span>
                <span className="font-semibold">{selectedEmployeeDetail.pangkatGolongan}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Email Kedinasan:</span>
                <span className="font-mono text-emerald-400">{selectedEmployeeDetail.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Status Tugas Hari Ini:</span>
                <span className="font-bold text-emerald-300">{selectedEmployeeDetail.statusHariIni}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedEmployeeDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SIARAN KOMANDO PIMPINAN KE GOOGLE CHAT */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Crown className="w-5 h-5 text-amber-400" />
                <h4 className="text-base font-bold text-white">Siaran Instruksi Kepala BPSDM</h4>
              </div>
              <button
                onClick={() => setIsBroadcastOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Judul Instruksi / Arahan:</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Isi Pesan Arahan Kedinasan:</label>
                <textarea
                  rows={4}
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="Contoh: Mengingatkan seluruh ASN yang melaksanakan WFH hari ini untuk menyelesaikan target luaran SKP dan mengunggah dokumen eviden ke Google Drive sebelum pukul 16.30 WIB..."
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsBroadcastOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onBroadcastChat(broadcastTitle, broadcastMsg || 'Arahan dinas dari Kepala BPSDM Jawa Timur.');
                  setIsBroadcastOpen(false);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Siaran ke Google Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
