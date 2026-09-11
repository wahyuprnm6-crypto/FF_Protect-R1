import React, { useState, useEffect } from 'react';
import { ASNProfile, UnitKerja, QuotaCalculation, UnitKerjaId } from '../types';
import { 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Sparkles, 
  Calendar, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface FwaApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAsn: ASNProfile;
  unitList: UnitKerja[];
  quotas: QuotaCalculation[];
  defaultUnitId?: UnitKerjaId;
  onSubmit: (payload: {
    asnId: string;
    tanggal: string;
    jenisKerja: 'WFH' | 'WFO';
    alasanRencanaKerja: string;
    rencanaLuaranKinerja: string[];
  }) => Promise<{ success: boolean; message: string; errorDetail?: string }>;
}

export const FwaApplicationModal: React.FC<FwaApplicationModalProps> = ({
  isOpen,
  onClose,
  currentAsn,
  unitList,
  quotas,
  defaultUnitId,
  onSubmit,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState<UnitKerjaId>(
    defaultUnitId || currentAsn.unitKerjaId
  );
  const [tanggal, setTanggal] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [jenisKerja, setJenisKerja] = useState<'WFH' | 'WFO'>('WFH');
  const [alasan, setAlasan] = useState<string>('');
  const [luaranList, setLuaranList] = useState<string[]>([
    'Review dan finalisasi berkas verifikasi peserta diklat Si-Praja',
  ]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isDispensasi, setIsDispensasi] = useState<boolean>(false);

  useEffect(() => {
    if (defaultUnitId) {
      setSelectedUnitId(defaultUnitId);
    } else {
      setSelectedUnitId(currentAsn.unitKerjaId);
    }
    setErrorMessage(null);
    setIsDispensasi(false);
  }, [defaultUnitId, currentAsn, isOpen]);

  if (!isOpen) return null;

  const activeQuota = quotas.find((q) => q.unitKerjaId === selectedUnitId);
  const isWfhQuotaFull = activeQuota ? activeQuota.jumlahWfhHariIni >= activeQuota.maksimalWfh : false;
  // Jika kuota penuh tapi memilih dispensasi khusus, form tetap boleh dikirimkan untuk evaluasi pimpinan
  const isSubmissionBlocked = jenisKerja === 'WFH' && isWfhQuotaFull && !isDispensasi;

  const handleAddLuaran = () => {
    setLuaranList([...luaranList, '']);
  };

  const handleSetHMinus1 = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setTanggal(tomorrow.toISOString().split('T')[0]);
  };

  const handleSetHariIni = () => {
    setTanggal(new Date().toISOString().split('T')[0]);
  };

  const handleRemoveLuaran = (idx: number) => {
    if (luaranList.length === 1) return;
    setLuaranList(luaranList.filter((_, i) => i !== idx));
  };

  const handleLuaranChange = (idx: number, val: string) => {
    const updated = [...luaranList];
    updated[idx] = val;
    setLuaranList(updated);
  };

  const handleQuickPreset = (preset: string) => {
    setAlasan(preset);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validLuaran = luaranList.filter((item) => item.trim() !== '');
    if (validLuaran.length === 0) {
      setErrorMessage('Wajib mencantumkan minimal 1 (satu) target luaran kinerja terukur sesuai PermenPANRB 6/2022.');
      return;
    }

    if (!alasan.trim()) {
      setErrorMessage('Wajib mencantumkan rincian rencana kerja.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onSubmit({
        asnId: currentAsn.id,
        tanggal,
        jenisKerja,
        alasanRencanaKerja: alasan,
        rencanaLuaranKinerja: validLuaran,
      });

      if (!res.success) {
        setErrorMessage(res.errorDetail || res.message);
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-700/80 text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                Formulir Pengajuan FWA / WFH ASN
              </h3>
              <p className="text-xs text-slate-300">
                Pemerintah Provinsi Jawa Timur • BPSDM Kampus Diklat
              </p>
            </div>
          </div>
          <button
            id="btn-close-fwa-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* ASN Information Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500">Pemohon (ASN Aktif):</div>
              <div className="font-bold text-slate-800 text-sm">{currentAsn.nama}</div>
              <div className="text-slate-500">
                NIP. {currentAsn.nip} • {currentAsn.pangkatGolongan}
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                {currentAsn.subBidang}
              </span>
            </div>
          </div>

          {/* Unit Kerja Selection & Real-Time Quota Check */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Unit Kerja / Bidang
            </label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value as UnitKerjaId)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
            >
              {unitList.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.nama} ({unit.totalAsn} ASN)
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal & Mode Kerja */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Tanggal Penugasan
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={handleSetHariIni}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded border"
                  >
                    Hari Ini
                  </button>
                  <button
                    type="button"
                    onClick={handleSetHMinus1}
                    className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300"
                  >
                    H-1 (Besok)
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 pl-8 focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Model Kerja Fleksibel
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setJenisKerja('WFH')}
                  className={`py-2 text-xs font-semibold rounded-lg border text-center transition ${
                    jenisKerja === 'WFH'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  WFH (Rumah)
                </button>
                <button
                  type="button"
                  onClick={() => setJenisKerja('WFO')}
                  className={`py-2 text-xs font-semibold rounded-lg border text-center transition ${
                    jenisKerja === 'WFO'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-800'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  WFO (Kampus)
                </button>
              </div>
            </div>
          </div>

          {/* REAL-TIME REGULATORY ENFORCEMENT BANNER (Perpres 21/2023) */}
          {activeQuota && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                isWfhQuotaFull && jenisKerja === 'WFH'
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
              }`}
            >
              {isWfhQuotaFull && jenisKerja === 'WFH' ? (
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 flex-1">
                <div className="font-bold">
                  {isWfhQuotaFull && jenisKerja === 'WFH'
                    ? 'Batas Kuota WFH 50% Tercapai (Perpres No. 21/2023)'
                    : 'Kapasitas Kuota WFH Masih Memenuhi Syarat Regulasi'}
                </div>
                <div className="text-[11px] leading-relaxed">
                  {activeQuota.unitKerjaNama}: Terisi{' '}
                  <span className="font-semibold">{activeQuota.jumlahWfhHariIni}</span> dari batas maksimal{' '}
                  <span className="font-semibold">{activeQuota.maksimalWfh} ASN</span> (Sisa:{' '}
                  <span className="font-semibold">{activeQuota.kuotaTersediaWfh} slot</span>).
                </div>

                {isWfhQuotaFull && jenisKerja === 'WFH' && (
                  <div className="mt-2 pt-2 border-t border-rose-200">
                    <label className="flex items-start gap-2 cursor-pointer bg-white p-2 rounded-lg border border-rose-300">
                      <input
                        type="checkbox"
                        checked={isDispensasi}
                        onChange={(e) => setIsDispensasi(e.target.checked)}
                        className="mt-0.5 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="text-[11px] text-slate-800 leading-tight">
                        <strong>Ajukan Dispensasi Khusus (Boleh Di Atas 50%)</strong>: Terdapat tugas mendesak kediklatan yang memerlukan persetujuan khusus Kepala BPSDM.
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Alasan & Rencana Kerja */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Uraian Rencana Kerja & Dasar Penugasan
              </label>
              <span className="text-[11px] text-slate-400">Contoh Cepat:</span>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              <button
                type="button"
                onClick={() =>
                  handleQuickPreset(
                    'Penyusunan kurikulum modul blended learning dan evaluasi tugas aksi perubahan peserta PKA via Si-Praja LMS.'
                  )
                }
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
              >
                Modul & Si-Praja
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickPreset(
                    'Verifikasi administrasi data registrasi 80 peserta Diklat Teknis serta persiapan instrumen uji kompetensi LSP.'
                  )
                }
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
              >
                Administrasi Peserta
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickPreset(
                    'Pengolahan data survei Evaluasi Pasca Pelatihan (EPP) dan penyusunan draf rekomendasi dampak kediklatan alumni.'
                  )
                }
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
              >
                Evaluasi EPP
              </button>
            </div>

            <textarea
              rows={2}
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Jelaskan alasan dan konteks pekerjaan yang akan diselesaikan..."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 font-normal"
              required
            />
          </div>

          {/* Dynamic Target Luaran Kinerja (PermenPANRB 6/2022) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Target Luaran Kinerja Terukur (PermenPANRB No. 6/2022)</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddLuaran}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Luaran</span>
              </button>
            </div>

            <div className="space-y-2">
              {luaranList.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400 w-4 text-center">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleLuaranChange(idx, e.target.value)}
                    placeholder="Contoh: Dokumen Modul Revisi, 1 Rekap Nilai Si-Praja, 1 Laporan EPP"
                    className="flex-1 text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  {luaranList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLuaran(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Luaran wajib diverifikasi dan dilampiri bukti dukung (eviden) pada jam kerja harian.
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              id="btn-submit-fwa-form"
              type="submit"
              disabled={isSubmitting || isSubmissionBlocked}
              className={`px-5 py-2 text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-2 ${
                isSubmissionBlocked
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              {isSubmitting ? (
                <span>Memproses...</span>
              ) : isSubmissionBlocked ? (
                <span>Terkunci Kuota 50%</span>
              ) : (
                <span>Kirim Permohonan FWA</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
