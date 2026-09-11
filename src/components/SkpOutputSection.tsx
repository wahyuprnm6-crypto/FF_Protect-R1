import React, { useState } from 'react';
import { SkpOutputItem, ASNProfile, KategoriKediklatan } from '../types';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  FileCheck, 
  Filter, 
  FolderPlus, 
  MessageSquare, 
  PlusCircle, 
  Star, 
  Tag
} from 'lucide-react';

interface SkpOutputSectionProps {
  outputs: SkpOutputItem[];
  currentAsn: ASNProfile;
  onSubmitOutput: (payload: {
    asnId: string;
    kategoriKediklatan: KategoriKediklatan;
    uraianTugas: string;
    targetKuantitas: number;
    satuanOutput: string;
    realisasiKuantitas: number;
    tautanEvidenDrive: string;
    namaFileEviden: string;
  }) => Promise<void>;
  onRateOutput: (
    id: string, 
    rating: 'DI_ATAS_EKSPEKTASI' | 'SESUAI_EKSPEKTASI' | 'DI_BAWAH_EKSPEKTASI', 
    feedback: string
  ) => Promise<void>;
  onOpenGoogleDriveSync: () => void;
}

export const SkpOutputSection: React.FC<SkpOutputSectionProps> = ({
  outputs,
  currentAsn,
  onSubmitOutput,
  onRateOutput,
  onOpenGoogleDriveSync,
}) => {
  const [selectedKategori, setSelectedKategori] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [ratingTargetId, setRatingTargetId] = useState<string | null>(null);
  const [ratingVal, setRatingVal] = useState<'DI_ATAS_EKSPEKTASI' | 'SESUAI_EKSPEKTASI' | 'DI_BAWAH_EKSPEKTASI'>('SESUAI_EKSPEKTASI');
  const [feedbackText, setFeedbackText] = useState<string>('');

  // Add Form State
  const [kategori, setKategori] = useState<KategoriKediklatan>('ADMINISTRASI_PESERTA');
  const [uraianTugas, setUraianTugas] = useState<string>('');
  const [targetKuantitas, setTargetKuantitas] = useState<number>(1);
  const [satuanOutput, setSatuanOutput] = useState<string>('Dokumen Terverifikasi');
  const [realisasiKuantitas, setRealisasiKuantitas] = useState<number>(1);
  const [tautanDrive, setTautanDrive] = useState<string>('https://drive.google.com/drive/folders/bpsdm-jatim-shared');
  const [namaFile, setNamaFile] = useState<string>('Eviden_Tugas_Kediklatan.pdf');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const canVerify = currentAsn.role === 'SUB_KOORDINATOR' || currentAsn.role === 'KEPALA_BIDANG' || currentAsn.role === 'ADMIN_KEPEGAWAIAN';

  const filteredOutputs = selectedKategori === 'ALL'
    ? outputs
    : outputs.filter((o) => o.kategoriKediklatan === selectedKategori);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uraianTugas.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmitOutput({
        asnId: currentAsn.id,
        kategoriKediklatan: kategori,
        uraianTugas,
        targetKuantitas,
        satuanOutput,
        realisasiKuantitas,
        tautanEvidenDrive: tautanDrive,
        namaFileEviden: namaFile,
      });
      setShowAddModal(false);
      setUraianTugas('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRating = async () => {
    if (!ratingTargetId) return;
    await onRateOutput(ratingTargetId, ratingVal, feedbackText || 'Luaran kinerja diverifikasi.');
    setRatingTargetId(null);
    setFeedbackText('');
  };

  const getKategoriLabel = (cat: KategoriKediklatan) => {
    switch (cat) {
      case 'ADMINISTRASI_PESERTA':
        return { label: 'Administrasi Peserta', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'KURIKULUM_MODUL':
        return { label: 'Kurikulum & Modul', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'KOORDINASI_WIDYAISWARA':
        return { label: 'Koordinasi Widyaiswara', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'EVALUASI_PASCA_PELATIHAN':
        return { label: 'Evaluasi Pasca Pelatihan (EPP)', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'LMS_SI_PRAJA':
        return { label: 'LMS Si-Praja', color: 'bg-teal-100 text-teal-800 border-teal-200' };
      default:
        return { label: cat, color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              Log Capaian Luaran Kinerja ASN (Output-Oriented)
            </h2>
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-200">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              PermenPANRB No. 6/2022
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Setiap ASN WFH/WFO wajib melaporkan target luaran terukur dengan bukti eviden yang terhubung ke Google Drive BPSDM Jatim.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-sync-drive-eviden"
            onClick={onOpenGoogleDriveSync}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 transition"
          >
            <FolderPlus className="w-3.5 h-3.5 text-blue-600" />
            <span>Folder Google Drive</span>
          </button>

          <button
            id="btn-add-skp-output"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Input Luaran Harian</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-3 border-b border-slate-100 text-xs font-medium">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
        <button
          onClick={() => setSelectedKategori('ALL')}
          className={`px-3 py-1 rounded-lg transition shrink-0 ${
            selectedKategori === 'ALL'
              ? 'bg-slate-800 text-white font-semibold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Semua Bidang Kediklatan ({outputs.length})
        </button>
        <button
          onClick={() => setSelectedKategori('ADMINISTRASI_PESERTA')}
          className={`px-3 py-1 rounded-lg transition shrink-0 ${
            selectedKategori === 'ADMINISTRASI_PESERTA'
              ? 'bg-blue-700 text-white font-semibold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Administrasi Peserta
        </button>
        <button
          onClick={() => setSelectedKategori('KURIKULUM_MODUL')}
          className={`px-3 py-1 rounded-lg transition shrink-0 ${
            selectedKategori === 'KURIKULUM_MODUL'
              ? 'bg-emerald-700 text-white font-semibold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Kurikulum & Modul
        </button>
        <button
          onClick={() => setSelectedKategori('KOORDINASI_WIDYAISWARA')}
          className={`px-3 py-1 rounded-lg transition shrink-0 ${
            selectedKategori === 'KOORDINASI_WIDYAISWARA'
              ? 'bg-purple-700 text-white font-semibold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Widyaiswara
        </button>
        <button
          onClick={() => setSelectedKategori('EVALUASI_PASCA_PELATIHAN')}
          className={`px-3 py-1 rounded-lg transition shrink-0 ${
            selectedKategori === 'EVALUASI_PASCA_PELATIHAN'
              ? 'bg-amber-700 text-white font-semibold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          EPP Diklat
        </button>
        <button
          onClick={() => setSelectedKategori('LMS_SI_PRAJA')}
          className={`px-3 py-1 rounded-lg transition shrink-0 ${
            selectedKategori === 'LMS_SI_PRAJA'
              ? 'bg-teal-700 text-white font-semibold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          LMS Si-Praja
        </button>
      </div>

      {/* Output Items Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {filteredOutputs.map((item) => {
          const badge = getKategoriLabel(item.kategoriKediklatan);
          const isComplete = item.realisasiKuantitas >= item.targetKuantitas;

          return (
            <div
              key={item.id}
              className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl p-4 transition flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Category & Status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.color}`}>
                    {badge.label}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isComplete ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        SELESAI
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3 text-amber-600" />
                        PROSES
                      </span>
                    )}

                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.tanggal}
                    </span>
                  </div>
                </div>

                {/* Task Description */}
                <h4 className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                  {item.uraianTugas}
                </h4>

                {/* ASN Identity */}
                <div className="text-[11px] text-slate-500 mt-1.5">
                  Pelaksana: <span className="font-semibold text-slate-700">{item.asnNama}</span>
                </div>

                {/* Target vs Realization */}
                <div className="mt-3 grid grid-cols-2 gap-2 bg-white rounded-lg p-2.5 border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Target Kinerja:</span>
                    <span className="font-bold text-slate-800">
                      {item.targetKuantitas} {item.satuanOutput}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Realisasi Capaian:</span>
                    <span className={`font-bold ${isComplete ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {item.realisasiKuantitas} {item.satuanOutput}
                    </span>
                  </div>
                </div>

                {/* Evidence File / Drive Link */}
                <div className="mt-2.5 flex items-center justify-between text-xs bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 truncate max-w-[240px]">
                    <Tag className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="text-[11px] text-slate-700 truncate font-mono">
                      {item.namaFileEviden}
                    </span>
                  </div>
                  <a
                    href={item.tautanEvidenDrive}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 hover:underline"
                  >
                    <span>Google Drive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Bottom: Supervisor Rating / Feedback */}
              <div className="mt-3 pt-3 border-t border-slate-200/70">
                {item.ratingAtasan ? (
                  <div className="bg-emerald-50/80 border border-emerald-200/70 rounded-lg p-2 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        Rating Evaluasi Kinerja (PermenPANRB 6/2022)
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded">
                        {item.ratingAtasan.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {item.umpanBalikAtasan && (
                      <p className="text-[11px] text-slate-600 italic">
                        "{item.umpanBalikAtasan}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 italic">
                      Menunggu evaluasi berkala atasan
                    </span>
                    {canVerify && (
                      <button
                        onClick={() => {
                          setRatingTargetId(item.id);
                          setRatingVal('SESUAI_EKSPEKTASI');
                        }}
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 transition"
                      >
                        Beri Penilaian Ekspektasi
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Input SKP Output */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-800">
                  Catat Luaran Kinerja Harian (SKP)
                </h3>
                <p className="text-xs text-slate-500">
                  Prinsip Akuntabilitas Output • BPSDM Provinsi Jawa Timur
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Tugas Kediklatan
                </label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as KategoriKediklatan)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="ADMINISTRASI_PESERTA">Administrasi Peserta Diklat</option>
                  <option value="KURIKULUM_MODUL">Kurikulum & Modul Pelatihan</option>
                  <option value="KOORDINASI_WIDYAISWARA">Koordinasi & Jam Mengajar Widyaiswara</option>
                  <option value="EVALUASI_PASCA_PELATIHAN">Evaluasi Pasca Pelatihan (EPP)</option>
                  <option value="LMS_SI_PRAJA">LMS Si-Praja (Pembelajaran Jarak Jauh)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Uraian Butir Kegiatan / Luaran
                </label>
                <textarea
                  rows={3}
                  value={uraianTugas}
                  onChange={(e) => setUraianTugas(e.target.value)}
                  placeholder="Contoh: Mengunggah modul ajar blended learning PKA dan memvalidasi kelengkapan 40 instrumen evaluasi..."
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Target
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={targetKuantitas}
                    onChange={(e) => setTargetKuantitas(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Realisasi
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={realisasiKuantitas}
                    onChange={(e) => setRealisasiKuantitas(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Satuan
                  </label>
                  <input
                    type="text"
                    value={satuanOutput}
                    onChange={(e) => setSatuanOutput(e.target.value)}
                    placeholder="Dokumen / Jam"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nama File Bukti Eviden
                  </label>
                  <input
                    type="text"
                    value={namaFile}
                    onChange={(e) => setNamaFile(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tautan Google Drive Folder
                  </label>
                  <input
                    type="url"
                    value={tautanDrive}
                    onChange={(e) => setTautanDrive(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Luaran Kinerja'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Rating Atasan */}
      {ratingTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Penilaian Ekspektasi Kinerja (PermenPANRB 6/2022)
            </h3>
            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700">Rating Kinerja:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRatingVal('DI_ATAS_EKSPEKTASI')}
                  className={`py-2 px-1 text-center font-semibold rounded-lg border text-[11px] ${
                    ratingVal === 'DI_ATAS_EKSPEKTASI'
                      ? 'bg-purple-100 border-purple-500 text-purple-900'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  Di Atas Ekspektasi
                </button>
                <button
                  type="button"
                  onClick={() => setRatingVal('SESUAI_EKSPEKTASI')}
                  className={`py-2 px-1 text-center font-semibold rounded-lg border text-[11px] ${
                    ratingVal === 'SESUAI_EKSPEKTASI'
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  Sesuai Ekspektasi
                </button>
                <button
                  type="button"
                  onClick={() => setRatingVal('DI_BAWAH_EKSPEKTASI')}
                  className={`py-2 px-1 text-center font-semibold rounded-lg border text-[11px] ${
                    ratingVal === 'DI_BAWAH_EKSPEKTASI'
                      ? 'bg-rose-100 border-rose-500 text-rose-900'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  Butuh Perbaikan
                </button>
              </div>

              <div className="pt-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Umpan Balik / Catatan Evaluasi Atasan:
                </label>
                <textarea
                  rows={2}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Catatan hasil verifikasi eviden..."
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setRatingTargetId(null)}
                className="px-3 py-1.5 text-xs text-slate-600"
              >
                Batal
              </button>
              <button
                onClick={handleSaveRating}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-700 text-white rounded-lg"
              >
                Simpan Penilaian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
