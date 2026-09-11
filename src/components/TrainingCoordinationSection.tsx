import React, { useState } from 'react';
import { DiklatAgenda, EppSurveyRecord, UnitKerja } from '../types';
import { 
  GraduationCap, 
  Video, 
  Calendar, 
  BookOpen, 
  Users, 
  BarChart3, 
  ExternalLink, 
  FileSpreadsheet, 
  Plus, 
  Server, 
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface TrainingCoordinationSectionProps {
  agendas: DiklatAgenda[];
  eppSurveys: EppSurveyRecord[];
  unitList: UnitKerja[];
  onScheduleMeet: (agenda: DiklatAgenda) => void;
  onCreateNewAgenda: (agenda: Omit<DiklatAgenda, 'id' | 'status'>) => Promise<void>;
  onOpenSheetsExport: () => void;
}

export const TrainingCoordinationSection: React.FC<TrainingCoordinationSectionProps> = ({
  agendas,
  eppSurveys,
  unitList,
  onScheduleMeet,
  onCreateNewAgenda,
  onOpenSheetsExport,
}) => {
  const [activeTab, setActiveTab] = useState<'JADWAL' | 'KURIKULUM' | 'EPP'>('JADWAL');
  const [showAddAgendaModal, setShowAddAgendaModal] = useState<boolean>(false);

  // New agenda form
  const [namaDiklat, setNamaDiklat] = useState('');
  const [unitKerjaId, setUnitKerjaId] = useState(unitList[1]?.id || 'pk_manajerial');
  const [widyaiswaraNama, setWidyaiswaraNama] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState(new Date().toISOString().split('T')[0]);
  const [tanggalSelesai, setTanggalSelesai] = useState(new Date().toISOString().split('T')[0]);
  const [waktu, setWaktu] = useState('08:30 - 15:30 WIB');
  const [jumlahPeserta, setJumlahPeserta] = useState(40);
  const [metode, setMetode] = useState<'BLENDED_LEARNING' | 'KLASIKAL' | 'E_LEARNING_SI_PRAJA'>('BLENDED_LEARNING');

  const handleSaveAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaDiklat.trim()) return;

    await onCreateNewAgenda({
      namaDiklat,
      unitKerjaId,
      widyaiswaraNama: widyaiswaraNama || 'Tim Widyaiswara BPSDM',
      tanggalMulai,
      tanggalSelesai,
      waktu,
      jumlahPeserta,
      metode,
      ruangAtauMeetLink: `https://meet.google.com/bps-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`,
    });

    setShowAddAgendaModal(false);
    setNamaDiklat('');
    setWidyaiswaraNama('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              Pusat Koordinasi Kediklatan & LMS Si-Praja
            </h2>
            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-medium border border-purple-200">
              <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
              Kampus BPSDM Jatim
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen kelas blended learning, jam mengajar Widyaiswara, integrasi Google Meet, dan survei Evaluasi Pasca Pelatihan (EPP).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSheetsExport}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor Rekap Diklat ke Sheets</span>
          </button>

          {activeTab === 'JADWAL' && (
            <button
              onClick={() => setShowAddAgendaModal(true)}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Agenda Diklat</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 my-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('JADWAL')}
          className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'JADWAL'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Jadwal Diklat & Widyaiswara ({agendas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('KURIKULUM')}
          className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'KURIKULUM'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Kurikulum, Modul & Si-Praja LMS</span>
        </button>

        <button
          onClick={() => setActiveTab('EPP')}
          className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'EPP'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Evaluasi Pasca Pelatihan (EPP)</span>
        </button>
      </div>

      {/* TAB 1: JADWAL & WIDYAISWARA */}
      {activeTab === 'JADWAL' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agendas.map((agenda) => (
            <div
              key={agenda.id}
              className="bg-slate-50/90 border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    agenda.metode === 'BLENDED_LEARNING'
                      ? 'bg-blue-100 text-blue-800'
                      : agenda.metode === 'E_LEARNING_SI_PRAJA'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {agenda.metode.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded">
                    {agenda.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-800 leading-tight">
                  {agenda.namaDiklat}
                </h4>

                <div className="text-xs text-slate-600 mt-2 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Widyaiswara: <strong className="text-slate-700">{agenda.widyaiswaraNama}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Waktu: {agenda.waktu}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{agenda.tanggalMulai} s/d {agenda.tanggalSelesai}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Jumlah Peserta: <span className="font-semibold text-slate-700">{agenda.jumlahPeserta} Orang</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                <a
                  href={agenda.ruangAtauMeetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
                >
                  <Video className="w-3.5 h-3.5 text-blue-600" />
                  <span>Google Meet</span>
                </a>

                <button
                  onClick={() => onScheduleMeet(agenda)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-300 transition"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sync Calendar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: KURIKULUM & LMS SI-PRAJA */}
      {activeTab === 'KURIKULUM' && (
        <div className="space-y-4">
          {/* Si-Praja Sync Status Banner */}
          <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-800 rounded-lg text-teal-300">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm">LMS Si-Praja Jawa Timur (Gateway Online)</h4>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-mono border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ONLINE 99.9%
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Sinkronisasi kelas virtual, evaluasi mandiri (pre-test/post-test), dan modul digital terintegrasi ASN.
                </p>
              </div>
            </div>

            <div className="text-xs font-mono text-teal-200 bg-teal-950/60 px-3 py-1.5 rounded-lg border border-teal-800/80 shrink-0">
              API Sync: sipraja.jatimprov.go.id
            </div>
          </div>

          {/* Curriculum Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Modul Pelatihan Kepemimpinan Administrator (PKA)
              </h4>
              <div className="space-y-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">Agenda I: Kepemimpinan Pancasila & Bela Negara</div>
                    <div className="text-[11px] text-slate-500">RPS & Bahan Ajar Multimedia • Widyaiswara: Dr. Agus Wibowo</div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    TERVERIFIKASI
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">Agenda II: Kepemimpinan Kinerja & Transformasi Digital</div>
                    <div className="text-[11px] text-slate-500">Bank Soal Si-Praja (50 Butir) • Widyaiswara: Tim SPBE</div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    TERVERIFIKASI
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">Agenda III: Manajemen Kinerja & Pengendalian Pelayanan Publik</div>
                    <div className="text-[11px] text-slate-500">Panduan Studi Lapangan (Stula) Blended Learning</div>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                    SIAP TAYANG
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-purple-600" />
                Modul Pelatihan Teknis & Fungsional BPSDM
              </h4>
              <div className="space-y-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">Tata Kelola SPBE & Keamanan Informasi Pemerintah</div>
                    <div className="text-[11px] text-slate-500">Standar BSSN & Diskominfo Jatim • 30 JP Si-Praja</div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    TERVERIFIKASI
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">Pengelolaan Barang Milik Daerah (BMD) Berbasis SIPD</div>
                    <div className="text-[11px] text-slate-500">Simulasi Aplikasi & Praktek Input • 40 JP Blended</div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    TERVERIFIKASI
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">Core Values ASN BerAKHLAK & Budaya Kerja CETTAR</div>
                    <div className="text-[11px] text-slate-500">Modul Wajib Seluruh ASN Pemprov Jatim</div>
                  </div>
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                    MODUL WAJIB
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EVALUASI PASCA PELATIHAN (EPP) */}
      {activeTab === 'EPP' && (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            <span className="font-bold">Standar LAN RI & BKD Jatim:</span> Evaluasi Pasca Pelatihan (EPP) dilaksanakan dalam rentang 3 hingga 6 bulan pasca kelulusan untuk mengukur retensi kompetensi dan kemanfaatan aksi perubahan di instansi asal peserta.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {eppSurveys.map((survey) => (
              <div
                key={survey.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {survey.statusEvaluasi.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {survey.angkatanTahun}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 leading-snug">
                    {survey.namaPelatihan}
                  </h4>

                  <div className="text-[11px] text-slate-500 mt-1">
                    Total Responden Alumni: <span className="font-semibold text-slate-700">{survey.jumlahAlumni} ASN</span>
                  </div>

                  {/* Indices Meter */}
                  <div className="mt-3 space-y-2 bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="text-slate-600">Indeks Kepuasan Alumni:</span>
                        <span className="font-bold text-emerald-700">{survey.indeksKepuasanAlumni}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full"
                          style={{ width: `${survey.indeksKepuasanAlumni}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="text-slate-600">Kemanfaatan di Instansi:</span>
                        <span className="font-bold text-blue-700">{survey.indeksKemanfaatanInstansi}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${survey.indeksKemanfaatanInstansi}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Arsip Google Drive</span>
                  <a
                    href={survey.tautanLaporanDrive}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                  >
                    <span>Buka Dokumen</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Tambah Agenda Baru */}
      {showAddAgendaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-800">Jadwalkan Pelatihan Baru</h3>
              <button
                onClick={() => setShowAddAgendaModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAgenda} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Pelatihan</label>
                <input
                  type="text"
                  value={namaDiklat}
                  onChange={(e) => setNamaDiklat(e.target.value)}
                  placeholder="Contoh: Pelatihan Kepemimpinan Pengawas Angkatan IX"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bidang Penyelenggara</label>
                <select
                  value={unitKerjaId}
                  onChange={(e) => setUnitKerjaId(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {unitList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Widyaiswara Pengampu</label>
                <input
                  type="text"
                  value={widyaiswaraNama}
                  onChange={(e) => setWidyaiswaraNama(e.target.value)}
                  placeholder="Contoh: Dr. Agus Wibowo, M.Pd"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={tanggalSelesai}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Metode Belajar</label>
                  <select
                    value={metode}
                    onChange={(e) => setMetode(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="BLENDED_LEARNING">Blended Learning</option>
                    <option value="E_LEARNING_SI_PRAJA">E-Learning Si-Praja</option>
                    <option value="KLASIKAL">Klasikal (Kampus)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jumlah Peserta</label>
                  <input
                    type="number"
                    value={jumlahPeserta}
                    onChange={(e) => setJumlahPeserta(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddAgendaModal(false)}
                  className="px-3 py-1.5 text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold bg-emerald-700 text-white rounded-lg"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
