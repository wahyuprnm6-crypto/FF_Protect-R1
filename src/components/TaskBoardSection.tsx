import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  FolderPlus, 
  ExternalLink, 
  PlusCircle, 
  Download, 
  AlertCircle, 
  Tag, 
  Layers, 
  CheckSquare, 
  FileText
} from 'lucide-react';
import { DailyTask, ASNProfile, KategoriKediklatan } from '../types';

interface TaskBoardSectionProps {
  tasks: DailyTask[];
  currentAsn: ASNProfile;
  onAddTask: (task: Omit<DailyTask, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateProgress: (taskId: string, progres: 0 | 50 | 100) => Promise<void>;
  onUpdateEvidence: (taskId: string, evidenceUrl: string, evidenceFileName: string) => Promise<void>;
}

export const TaskBoardSection: React.FC<TaskBoardSectionProps> = ({
  tasks,
  currentAsn,
  onAddTask,
  onUpdateProgress,
  onUpdateEvidence,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [evidenceModalTask, setEvidenceModalTask] = useState<DailyTask | null>(null);

  // New task form state
  const [judulTugas, setJudulTugas] = useState<string>('');
  const [kategori, setKategori] = useState<KategoriKediklatan>('ADMINISTRASI_PESERTA');
  const [targetKuantitas, setTargetKuantitas] = useState<number>(1);
  const [satuan, setSatuan] = useState<string>('Dokumen Terverifikasi');
  const [evidenceUrl, setEvidenceUrl] = useState<string>('https://drive.google.com/drive/folders/bpsdm-jatim-evidence');
  const [evidenceFileName, setEvidenceFileName] = useState<string>('Eviden_Kinerja_ASN.pdf');

  // Evidence update state
  const [editUrl, setEditUrl] = useState<string>('');
  const [editFileName, setEditFileName] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];
  const userTasksToday = tasks.filter((t) => t.asnId === currentAsn.id && t.tanggal === todayStr);
  const hasMinTwoTasks = userTasksToday.length >= 2;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judulTugas.trim()) return;

    await onAddTask({
      asnId: currentAsn.id,
      asnNama: currentAsn.nama,
      asnNip: currentAsn.nip,
      bidang: currentAsn.unitKerjaId,
      judulTugas,
      kategori,
      targetKuantitas,
      satuan,
      progres: 0,
      evidenceUrl,
      evidenceFileName,
      status: 'BELUM_MULAI',
      tanggal: todayStr,
    });

    setShowAddModal(false);
    setJudulTugas('');
  };

  const handleSaveEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceModalTask) return;

    await onUpdateEvidence(evidenceModalTask.id, editUrl, editFileName);
    setEvidenceModalTask(null);
  };

  // Ekspor CSV e-Kinerja BKD
  const exportCsv = () => {
    const headers = ['No', 'NIP', 'Nama ASN', 'Unit Kerja', 'Tanggal', 'Judul Butir Kegiatan', 'Kategori', 'Target', 'Satuan', 'Progres (%)', 'Status', 'Tautan Evidence Drive'];
    const rows = tasks.map((t, idx) => [
      idx + 1,
      `'${t.asnNip}`,
      `"${t.asnNama}"`,
      t.bidang,
      t.tanggal,
      `"${t.judulTugas.replace(/"/g, '""')}"`,
      t.kategori,
      t.targetKuantitas,
      t.satuan,
      t.progres,
      t.status,
      t.evidenceUrl,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `e-Kinerja_BKD_BPSDM_Jatim_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Ekspor JSON e-Kinerja BKD
  const exportJson = () => {
    const exportData = {
      instansi: 'Badan Pengembangan Sumber Daya Manusia Provinsi Jawa Timur',
      standar: 'PermenPANRB No. 6/2022 & Perpres No. 21/2023',
      tanggalEkspor: new Date().toISOString(),
      pegawai: {
        nip: currentAsn.nip,
        nama: currentAsn.nama,
        unit: currentAsn.unitKerjaId,
      },
      totalTugas: tasks.length,
      tasks: tasks,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `e-Kinerja_BKD_BPSDM_Jatim_${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              Papan Penugasan & Rencana Kinerja Harian
            </h3>
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              Minimal 2 Target Luaran WFH
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Akuntabilitas output ASN BPSDM Jatim sesuai PermenPANRB No. 6/2022. Wajib melampirkan bukti fisik digital.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 transition"
            title="Ekspor CSV untuk e-Kinerja BKD Jatim"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={exportJson}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 transition"
            title="Ekspor JSON untuk e-Kinerja BKD Jatim"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Ekspor JSON</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Target Kinerja</span>
          </button>
        </div>
      </div>

      {/* Compliance Indicator Banner */}
      <div className={`my-4 p-3 rounded-xl border text-xs flex items-center justify-between ${
        hasMinTwoTasks
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-2">
          {hasMinTwoTasks ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>
            {hasMinTwoTasks
              ? `Kepatuhan Terpenuhi: Anda telah mencatat ${userTasksToday.length} target luaran kinerja untuk hari ini.`
              : `Perhatian Kinerja WFH: Anda baru mencatat ${userTasksToday.length} target. Wajib minimal 2 target luaran terukur.`}
          </span>
        </div>
        <span className="font-bold text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
          Target Hari Ini: {userTasksToday.length}/2
        </span>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between transition"
          >
            <div>
              {/* Category & Status */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                  {task.kategori.replace(/_/g, ' ')}
                </span>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  task.progres === 100
                    ? 'bg-emerald-100 text-emerald-800'
                    : task.progres === 50
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {task.progres === 100 ? 'SELESAI (100%)' : task.progres === 50 ? 'SEDANG DIKERJAKAN (50%)' : 'BELUM DIMULAI (0%)'}
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                {task.judulTugas}
              </h4>

              <div className="text-[11px] text-slate-500 mt-1">
                ASN: <strong className="text-slate-700">{task.asnNama}</strong>
              </div>

              {/* Target & Satuan */}
              <div className="mt-3 bg-white p-2 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                <span className="text-slate-500 text-[11px]">Target Luaran:</span>
                <span className="font-bold text-slate-800">
                  {task.targetKuantitas} {task.satuan}
                </span>
              </div>

              {/* Evidence File Info */}
              <div className="mt-2 text-xs bg-slate-100/70 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="truncate max-w-[170px] text-[11px] text-slate-600 font-mono flex items-center gap-1">
                  <Tag className="w-3 h-3 text-blue-600 shrink-0" />
                  <span className="truncate">{task.evidenceFileName}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setEvidenceModalTask(task);
                      setEditUrl(task.evidenceUrl);
                      setEditFileName(task.evidenceFileName);
                    }}
                    className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    Edit Bukti
                  </button>
                  <a
                    href={task.evidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                    title="Buka Dokumen di Google Drive"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Interactive Progress Controller (0% -> 50% -> 100%) */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">
                Perbarui Status Progres Pengerjaan:
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <button
                  onClick={() => onUpdateProgress(task.id, 0)}
                  className={`py-1.5 text-[10px] font-bold rounded-lg border transition ${
                    task.progres === 0
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  0%
                </button>
                <button
                  onClick={() => onUpdateProgress(task.id, 50)}
                  className={`py-1.5 text-[10px] font-bold rounded-lg border transition ${
                    task.progres === 50
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  50%
                </button>
                <button
                  onClick={() => onUpdateProgress(task.id, 100)}
                  className={`py-1.5 text-[10px] font-bold rounded-lg border transition ${
                    task.progres === 100
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  100%
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Tambah Target Kinerja Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-800">Tambah Target Kinerja Harian</h3>
                <p className="text-[11px] text-slate-500">Standar Akuntabilitas Luaran PermenPANRB 6/2022</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Tugas Kediklatan</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as KategoriKediklatan)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="ADMINISTRASI_PESERTA">Administrasi Peserta Pelatihan</option>
                  <option value="KURIKULUM_MODUL">Kurikulum & Modul Pembelajaran</option>
                  <option value="KOORDINASI_WIDYAISWARA">Koordinasi & Mengajar Widyaiswara</option>
                  <option value="EVALUASI_PASCA_PELATIHAN">Evaluasi Pasca Pelatihan (EPP)</option>
                  <option value="LMS_SI_PRAJA">Pengelolaan LMS Si-Praja Jawa Timur</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Uraian Butir Kegiatan / Target Luaran</label>
                <textarea
                  rows={2}
                  value={judulTugas}
                  onChange={(e) => setJudulTugas(e.target.value)}
                  placeholder="Contoh: Mengunggah dan memvalidasi 40 data peserta PKA Angkatan IX pada LMS Si-Praja..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Kuantitas</label>
                  <input
                    type="number"
                    min={1}
                    value={targetKuantitas}
                    onChange={(e) => setTargetKuantitas(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Satuan Hasil</label>
                  <input
                    type="text"
                    value={satuan}
                    onChange={(e) => setSatuan(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama File Bukti Fisik</label>
                  <input
                    type="text"
                    value={evidenceFileName}
                    onChange={(e) => setEvidenceFileName(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-[11px]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tautan Google Drive</label>
                  <input
                    type="url"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-[11px]"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
                >
                  Simpan Target Kinerja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Bukti Fisik Digital */}
      {evidenceModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-3 text-xs">
            <h3 className="font-bold text-sm text-slate-800">
              Perbarui Bukti Fisik Evidence (Google Drive)
            </h3>
            <p className="text-slate-500">
              Tugas: <strong>{evidenceModalTask.judulTugas}</strong>
            </p>

            <form onSubmit={handleSaveEvidence} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama File Bukti Dokumen</label>
                <input
                  type="text"
                  value={editFileName}
                  onChange={(e) => setEditFileName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tautan Berkas / Folder Google Drive</label>
                <input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEvidenceModalTask(null)}
                  className="px-3 py-1.5 text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold bg-emerald-700 text-white rounded-lg"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
