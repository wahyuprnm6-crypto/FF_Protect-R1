import React, { useState } from 'react';
import { GoogleWorkspaceState, FwaRequest, SkpOutputItem, DiklatAgenda, QuotaCalculation } from '../types';
import { 
  X, 
  Calendar, 
  FileSpreadsheet, 
  FolderPlus, 
  MessageSquare, 
  Video, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  FolderSync, 
  Send
} from 'lucide-react';
import { 
  createCalendarMeetEvent, 
  createDriveFolder, 
  exportFwaToGoogleSheets 
} from '../services/workspace';

interface WorkspaceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceState: GoogleWorkspaceState;
  onGoogleSignIn: () => void;
  fwaRequests: FwaRequest[];
  skpOutputs: SkpOutputItem[];
  agendas: DiklatAgenda[];
  quotas: QuotaCalculation[];
  onSendChatNotification: (title: string, message: string, tipe: string) => Promise<any>;
}

export const WorkspaceSyncModal: React.FC<WorkspaceSyncModalProps> = ({
  isOpen,
  onClose,
  workspaceState,
  onGoogleSignIn,
  fwaRequests,
  skpOutputs,
  agendas,
  quotas,
  onSendChatNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'SHEETS' | 'CALENDAR' | 'DRIVE' | 'CHAT'>('SHEETS');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string; link?: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Calendar Event Form
  const [eventTitle, setEventTitle] = useState('Rapat Koordinasi Evaluasi Pasca Pelatihan & FWA ASN');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTimeStart, setEventTimeStart] = useState('09:00');
  const [eventTimeEnd, setEventTimeEnd] = useState('10:30');

  // Drive Folder Form
  const [folderName, setFolderName] = useState('Arsip Modul & Eviden FWA BPSDM Jatim 2026');

  // Chat Webhook Form
  const [chatTitle, setChatTitle] = useState('Peringatan Kuota WFH 50% & Briefing Pagi Kediklatan');
  const [chatMessage, setChatMessage] = useState('Diinformasikan kepada seluruh ASN BPSDM Jatim, kuota WFH hari ini telah terisi sesuai Perpres 21/2023. Mohon seluruh ASN WFH mengunggah eviden SKP di Si-Praja sebelum pukul 16:30 WIB.');
  const [chatType, setChatType] = useState('PENGUMUMAN_RESMI');

  if (!isOpen) return null;

  // 1. Export FWA Attendance to Sheets
  const handleExportFwaSheets = async () => {
    if (!workspaceState.accessToken) {
      onGoogleSignIn();
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const title = `Rekap Presensi FWA BPSDM Jatim - ${today} (Perpres 21/2023)`;

      const rows: string[][] = [
        ['PEMERINTAH PROVINSI JAWA TIMUR'],
        ['BADAN PENGEMBANGAN SUMBER DAYA MANUSIA (BPSDM)'],
        [`REKAPITULASI PRESENSI SISTEM KERJA FLEKSIBEL (FWA) & KEPATUHAN KUOTA 50%`],
        [`Tanggal Unduh: ${new Date().toLocaleString('id-ID')} WIB`],
        [],
        ['No', 'Nama ASN', 'NIP', 'Unit Kerja / Bidang', 'Sub-Bidang', 'Jenis Tugas', 'Status Pengajuan', 'Rencana Luaran Kinerja', 'Diverifikasi Oleh'],
      ];

      fwaRequests.forEach((req, idx) => {
        rows.push([
          String(idx + 1),
          req.asnNama,
          `'${req.asnNip}`,
          req.unitKerjaId,
          req.subBidang,
          req.jenisKerja,
          req.status,
          req.rencanaLuaranKinerja.join('; '),
          req.diverifikasiOleh || 'Sistem SPBE',
        ]);
      });

      const res = await exportFwaToGoogleSheets(workspaceState.accessToken, title, rows);
      setStatusMessage({
        type: 'success',
        text: `Berhasil mengekspor data presensi ke Google Sheets!`,
        link: res.spreadsheetUrl,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal mengekspor data ke Google Sheets',
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. Export SKP Outputs to Sheets
  const handleExportSkpSheets = async () => {
    if (!workspaceState.accessToken) {
      onGoogleSignIn();
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const title = `Log Capaian Luaran Kinerja SKP ASN BPSDM Jatim - ${today} (PermenPANRB 6/2022)`;

      const rows: string[][] = [
        ['PEMERINTAH PROVINSI JAWA TIMUR - BPSDM'],
        ['LAPORAN HARIAN LUARAN KINERJA PEGAWAI (OUTPUT-ORIENTED)'],
        [`Tanggal Ekspor: ${new Date().toLocaleString('id-ID')} WIB`],
        [],
        ['No', 'Nama ASN', 'Tanggal', 'Kategori Kediklatan', 'Uraian Tugas', 'Target', 'Realisasi', 'Satuan', 'Status', 'Rating Atasan', 'Tautan Eviden Drive'],
      ];

      skpOutputs.forEach((item, idx) => {
        rows.push([
          String(idx + 1),
          item.asnNama,
          item.tanggal,
          item.kategoriKediklatan,
          item.uraianTugas,
          String(item.targetKuantitas),
          String(item.realisasiKuantitas),
          item.satuanOutput,
          item.statusCapaian,
          item.ratingAtasan || 'Menunggu Penilaian',
          item.tautanEvidenDrive,
        ]);
      });

      const res = await exportFwaToGoogleSheets(workspaceState.accessToken, title, rows);
      setStatusMessage({
        type: 'success',
        text: `Berhasil mengekspor Log SKP ke Google Sheets!`,
        link: res.spreadsheetUrl,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal mengekspor data SKP ke Google Sheets',
      });
    } finally {
      setLoading(false);
    }
  };

  // 3. Create Google Calendar & Meet Event
  const handleCreateCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceState.accessToken) {
      onGoogleSignIn();
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const startDateTime = `${eventDate}T${eventTimeStart}:00+07:00`;
      const endDateTime = `${eventDate}T${eventTimeEnd}:00+07:00`;

      const res = await createCalendarMeetEvent(workspaceState.accessToken, {
        summary: eventTitle,
        description: `Koordinasi Kediklatan BPSDM Jatim diselenggarakan secara daring via Google Meet. Membahas penegakan kuota FWA, pemantauan LMS Si-Praja, dan modul ajar.`,
        startDateTime,
        endDateTime,
        withMeetLink: true,
      });

      setStatusMessage({
        type: 'success',
        text: `Agenda Google Calendar berhasil dibuat dengan link Google Meet!`,
        link: res.meetLink || res.htmlLink,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal membuat agenda Google Calendar',
      });
    } finally {
      setLoading(false);
    }
  };

  // 4. Create Google Drive Shared Folder
  const handleCreateDriveFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceState.accessToken) {
      onGoogleSignIn();
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await createDriveFolder(workspaceState.accessToken, folderName);
      setStatusMessage({
        type: 'success',
        text: `Folder Google Drive berhasil dibuat untuk arsip kediklatan BPSDM!`,
        link: res.webViewLink,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal membuat folder Google Drive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 5. Send Google Chat Space Notification
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      await onSendChatNotification(chatTitle, chatMessage, chatType);
      setStatusMessage({
        type: 'success',
        text: 'Notifikasi berhasil disiarkan ke Google Chat Space BPSDM Jawa Timur!',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: 'Gagal mengirimkan notifikasi Google Chat',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <FolderSync className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                Integrasi Native Google Workspace BPSDM
              </h3>
              <p className="text-xs text-slate-300">
                Google Calendar, Google Meet, Google Drive, Google Sheets & Chat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth status banner */}
        {!workspaceState.isSignedIn && (
          <div className="bg-blue-50 border-b border-blue-200 p-3 px-6 flex items-center justify-between text-xs text-blue-900">
            <span>Login dengan akun Google Workspace resmi untuk mengaktifkan sinkronisasi cloud:</span>
            <button
              onClick={onGoogleSignIn}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition"
            >
              Sign in with Google
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-semibold px-6 pt-2 bg-slate-50">
          <button
            onClick={() => { setActiveTab('SHEETS'); setStatusMessage(null); }}
            className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'SHEETS'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Sheets</span>
          </button>

          <button
            onClick={() => { setActiveTab('CALENDAR'); setStatusMessage(null); }}
            className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'CALENDAR'
                ? 'border-blue-600 text-blue-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Calendar & Meet</span>
          </button>

          <button
            onClick={() => { setActiveTab('DRIVE'); setStatusMessage(null); }}
            className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'DRIVE'
                ? 'border-amber-600 text-amber-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-600" />
            <span>Google Drive</span>
          </button>

          <button
            onClick={() => { setActiveTab('CHAT'); setStatusMessage(null); }}
            className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'CHAT'
                ? 'border-indigo-600 text-indigo-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            <span>Chat Webhook</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div>{statusMessage.text}</div>
                {statusMessage.link && (
                  <a
                    href={statusMessage.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 underline"
                  >
                    <span>Buka Tautan Google Workspace</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: SHEETS */}
          {activeTab === 'SHEETS' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Ekspor Rekapitulasi Presensi FWA ASN (Perpres 21/2023)
                </h4>
                <p className="text-slate-500 mb-3 leading-relaxed">
                  Menghasilkan lembar kerja Google Sheets baru berisi seluruh rekap presensi ASN, persentase WFH/WFO 50%, verifikasi sub-koordinator, dan rincian luaran.
                </p>
                <button
                  onClick={handleExportFwaSheets}
                  disabled={loading}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-lg shadow-sm transition inline-flex items-center gap-2"
                >
                  {loading ? 'Membuat Spreadsheet...' : 'Buat Spreadsheet Presensi FWA'}
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Ekspor Log Capaian Kinerja SKP (PermenPANRB 6/2022)
                </h4>
                <p className="text-slate-500 mb-3 leading-relaxed">
                  Mengekspor seluruh luaran tugas kediklatan harian, status capaian, tautan eviden dokumen Drive, serta rating ekspektasi atasan ke Google Sheets.
                </p>
                <button
                  onClick={handleExportSkpSheets}
                  disabled={loading}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-lg shadow-sm transition inline-flex items-center gap-2"
                >
                  {loading ? 'Membuat Spreadsheet...' : 'Buat Spreadsheet Log SKP'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CALENDAR & MEET */}
          {activeTab === 'CALENDAR' && (
            <form onSubmit={handleCreateCalendarEvent} className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Preset Otomasi:</span>
                <button
                  type="button"
                  onClick={() => {
                    setEventTitle('[WFH BPSDM JATIM] Focus Block - Jam Kedinasan Remote');
                    setEventTimeStart('08:00');
                    setEventTimeEnd('16:00');
                  }}
                  className="text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-2 py-1 rounded border border-blue-200 transition"
                >
                  Set Focus Block (08.00 - 16.00 WIB)
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul Agenda / Blok Fokus Kerja
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={eventTimeStart}
                    onChange={(e) => setEventTimeStart(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={eventTimeEnd}
                    onChange={(e) => setEventTimeEnd(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-800">
                <Video className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Link Google Meet Hub akan otomatis dibuat dan disematkan ke dalam undangan kalender.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow-sm transition"
              >
                {loading ? 'Menghubungkan ke Calendar...' : 'Jadwalkan di Google Calendar & Buat Meet'}
              </button>
            </form>
          )}

          {/* TAB 3: DRIVE */}
          {activeTab === 'DRIVE' && (
            <form onSubmit={handleCreateDriveFolder} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Shared Folder Kediklatan Google Drive
                </label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 leading-relaxed font-mono text-[11px]">
                <strong className="font-sans block mb-1 font-bold text-emerald-950">
                  Format Struktur Subfolder Otomatis Backend Code.gs:
                </strong>
                BPSDM_JATIM_EVIDENCE_FWA / [Tahun] / [Bulan] / [Bidang] / [NIP_Nama] / [Tanggal]
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-lg shadow-sm transition flex items-center justify-center gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                <span>{loading ? 'Membuat Folder...' : 'Buat Folder Bersama di Google Drive'}</span>
              </button>
            </form>
          )}

          {/* TAB 4: CHAT WEBHOOK */}
          {activeTab === 'CHAT' && (
            <form onSubmit={handleSendChat} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kategori Pengumuman
                </label>
                <select
                  value={chatType}
                  onChange={(e) => setChatType(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                >
                  <option value="PENGUMUMAN_RESMI">Pengumuman Resmi BPSDM</option>
                  <option value="PERINGATAN_KUOTA_WFH">Peringatan Kuota WFH 50% (Perpres 21/2023)</option>
                  <option value="REMINDER_EVIDEN_SKP">Pengingat Pengunggahan Eviden SKP</option>
                  <option value="BRIEFING_KEDIKLATAN">Briefing Pagi Widyaiswara</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Pesan</label>
                <input
                  type="text"
                  value={chatTitle}
                  onChange={(e) => setChatTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Isi Pesan Siaran</label>
                <textarea
                  rows={3}
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg shadow-sm transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Mengirim Siaran...' : 'Kirim Siaran ke Google Chat Space BPSDM'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
