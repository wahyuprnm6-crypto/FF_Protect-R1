import React, { useState } from 'react';
import { FwaRequest, ASNProfile, UnitKerjaId } from '../types';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Home, 
  Building, 
  ShieldCheck, 
  User, 
  FileText, 
  Search,
  Filter
} from 'lucide-react';

interface FwaRequestsSectionProps {
  requests: FwaRequest[];
  currentAsn: ASNProfile;
  onVerifyRequest: (id: string, status: 'DISETUJUI' | 'DITOLAK', catatan?: string) => Promise<void>;
  onOpenNewApplication: () => void;
}

export const FwaRequestsSection: React.FC<FwaRequestsSectionProps> = ({
  requests,
  currentAsn,
  onVerifyRequest,
  onOpenNewApplication,
}) => {
  const [filterUnit, setFilterUnit] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<{ id: string; status: 'DISETUJUI' | 'DITOLAK' } | null>(null);
  const [catatan, setCatatan] = useState<string>('');

  const canVerify = 
    currentAsn.role === 'SUB_KOORDINATOR' || 
    currentAsn.role === 'KEPALA_BIDANG' || 
    currentAsn.role === 'ADMIN_KEPEGAWAIAN';

  const filteredRequests = requests.filter((r) => {
    if (filterUnit !== 'ALL' && r.unitKerjaId !== filterUnit) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return r.asnNama.toLowerCase().includes(q) || r.asnNip.includes(q) || r.alasanRencanaKerja.toLowerCase().includes(q);
    }
    return true;
  });

  const handleConfirmVerify = async () => {
    if (!actionFeedback) return;
    await onVerifyRequest(actionFeedback.id, actionFeedback.status, catatan || undefined);
    setActionFeedback(null);
    setCatatan('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              Daftar Permohonan & Verifikasi FWA / WFH ASN
            </h2>
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-medium border border-blue-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Kontrol Kuota 50%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Otorisasi berjenjang oleh Sub-Koordinator & Kepala Bidang untuk menjamin rotasi WFO/WFH yang adil dan akuntabel.
          </p>
        </div>

        <button
          onClick={onOpenNewApplication}
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow transition shrink-0"
        >
          + Ajukan Permohonan Baru
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 text-xs">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama ASN, NIP, atau tugas..."
            className="w-full p-2 pl-8 border border-slate-300 rounded-lg bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <div>
          <select
            value={filterUnit}
            onChange={(e) => setFilterUnit(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
          >
            <option value="ALL">Semua Unit Kerja</option>
            <option value="sekretariat">Sekretariat</option>
            <option value="pk_manajerial">Bidang PK Manajerial</option>
            <option value="pk_fungsional_soskul">Bidang PK Fungsional & Sos-Kul</option>
            <option value="sertifikasi_penjaminan_mutu">Bidang Sertifikasi & Mutu</option>
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
          >
            <option value="ALL">Semua Status Verifikasi</option>
            <option value="DISETUJUI">Disetujui (Kuota Memenuhi)</option>
            <option value="MENUNGGU">Menunggu Verifikasi</option>
            <option value="DITOLAK">Ditolak / Over Kuota</option>
          </select>
        </div>
      </div>

      {/* Table / List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Tidak ada permohonan FWA yang sesuai kriteria pencarian.
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-slate-50/90"
            >
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-slate-800">
                    {req.asnNama}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    NIP. {req.asnNip}
                  </span>

                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                    req.jenisKerja === 'WFH'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  }`}>
                    {req.jenisKerja === 'WFH' ? <Home className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                    {req.jenisKerja}
                  </span>

                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                    req.status === 'DISETUJUI'
                      ? 'bg-emerald-100 text-emerald-800'
                      : req.status === 'DITOLAK'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {req.status === 'DISETUJUI' ? (
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                    ) : req.status === 'DITOLAK' ? (
                      <XCircle className="w-3 h-3 text-rose-600" />
                    ) : (
                      <Clock className="w-3 h-3 text-amber-600" />
                    )}
                    {req.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  <span className="font-medium text-slate-700">{req.subBidang}</span> • Tanggal:{' '}
                  <span className="font-semibold text-slate-800">{req.tanggal}</span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <strong className="text-slate-800">Rencana Kerja:</strong> {req.alasanRencanaKerja}
                </p>

                {req.rencanaLuaranKinerja && req.rencanaLuaranKinerja.length > 0 && (
                  <div className="text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700">Target Output:</span>{' '}
                    {req.rencanaLuaranKinerja.join('; ')}
                  </div>
                )}

                {req.catatanAtasan && (
                  <div className="text-[11px] text-slate-500 italic bg-blue-50/60 p-1.5 rounded border border-blue-200/50">
                    Verifikasi: {req.catatanAtasan} (Oleh: {req.diverifikasiOleh || 'Atasan'})
                  </div>
                )}
              </div>

              {/* Action Buttons for Supervisor */}
              {canVerify && (
                <div className="flex sm:flex-col items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => {
                      setActionFeedback({ id: req.id, status: 'DISETUJUI' });
                      setCatatan('Disetujui. Kuota unit kerja terpenuhi.');
                    }}
                    className="flex-1 sm:flex-none text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg shadow-2xs transition flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Setujui</span>
                  </button>

                  <button
                    onClick={() => {
                      setActionFeedback({ id: req.id, status: 'DITOLAK' });
                      setCatatan('Ditolak untuk rotasi WFO demi kelangsungan pelayanan diklat.');
                    }}
                    className="flex-1 sm:flex-none text-xs font-semibold bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      {actionFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-3 text-xs">
            <h3 className="font-bold text-sm text-slate-800">
              Konfirmasi Verifikasi Permohonan ({actionFeedback.status})
            </h3>
            <p className="text-slate-600">
              Sebagai Sub-Koordinator / Atasan, Anda akan memproses permohonan ini sesuai kepatuhan kuota 50% WFH Perpres 21/2023.
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Catatan / Arahan Atasan:
              </label>
              <textarea
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setActionFeedback(null)}
                className="px-3 py-1.5 text-slate-600"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmVerify}
                className={`px-4 py-1.5 font-bold text-white rounded-lg ${
                  actionFeedback.status === 'DISETUJUI' ? 'bg-emerald-700' : 'bg-rose-700'
                }`}
              >
                Simpan Otorisasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
