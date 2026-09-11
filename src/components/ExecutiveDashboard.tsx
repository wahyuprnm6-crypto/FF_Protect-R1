import React from 'react';
import { 
  Building2, 
  Users, 
  Home, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  FileCheck, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  FileSpreadsheet,
  UserCog
} from 'lucide-react';
import { QuotaCalculation, FwaRequest, ASNProfile } from '../types';
import { BpsdmLogo } from './BpsdmLogo';

interface ExecutiveDashboardProps {
  quotas: QuotaCalculation[];
  fwaRequests: FwaRequest[];
  asnProfiles: ASNProfile[];
  onApproveRequest: (requestId: string, status: 'DISETUJUI' | 'DITOLAK') => Promise<void>;
  onOpenManageAsn?: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  quotas,
  fwaRequests,
  asnProfiles,
  onApproveRequest,
  onOpenManageAsn,
}) => {
  const totalAsn = quotas.reduce((acc, q) => acc + q.totalAsn, 0);
  const totalWfh = quotas.reduce((acc, q) => acc + q.jumlahWfhHariIni, 0);
  const totalWfo = totalAsn - totalWfh;
  const overallPercentage = totalAsn > 0 ? Math.round((totalWfh / totalAsn) * 100) : 0;
  const isGlobalQuotaExceeded = overallPercentage > 50;

  // Permohonan yang membutuhkan atensi pimpinan (misal: di atas kuota atau dispensasi khusus)
  const pendingOrDispensasiRequests = fwaRequests.filter(
    (r) => r.status === 'MENUNGGU' || r.alasanRencanaKerja.toLowerCase().includes('dispensasi')
  );

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Key Metrics */}
      <div className="bg-linear-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/95 rounded-2xl p-1 shadow-md border border-orange-400/50 flex items-center justify-center shrink-0">
              <BpsdmLogo variant="icon" size={48} />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-400/30">
                <Shield className="w-3.5 h-3.5" />
                Mode Pengawasan Pimpinan: Kepala BPSDM Provinsi Jawa Timur
              </span>
              <h2 className="text-xl sm:text-2xl font-bold mt-1.5">
                Dasbor Eksekutif Pemantauan Kehadiran 5 Unit Kerja BPSDM Jatim
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Pengawasan terpadu tata kelola FWA (WFA Hingga 100% SE No. 800/1141/204/2026 & Pergub Jatim No. 71/2023) Kampus Utama Balongsari Surabaya.
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10 text-center min-w-[200px]">
            <span className="text-xs text-slate-300 block font-medium">Rasio WFH Gabungan BPSDM:</span>
            <div className="text-3xl font-black mt-1 flex items-center justify-center gap-2">
              <span className={isGlobalQuotaExceeded ? 'text-rose-400' : 'text-emerald-400'}>
                {overallPercentage}%
              </span>
              <span className="text-xs font-normal text-slate-300">/ Maks 50%</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-2 ${
              isGlobalQuotaExceeded ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
            }`}>
              {isGlobalQuotaExceeded ? '⚠️ Batas Kuota Terlampaui' : '✓ Memenuhi Regulasi Kuota'}
            </span>

            {onOpenManageAsn && (
              <button
                onClick={onOpenManageAsn}
                className="mt-3 w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <UserCog className="w-3.5 h-3.5" />
                <span>Kelola Pegawai BPSDM</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Summary Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 p-3 rounded-xl">
            <span className="text-xs text-slate-400 block">Total Pegawai ASN:</span>
            <strong className="text-xl font-bold text-white">{totalAsn} Orang</strong>
          </div>
          <div className="bg-white/5 p-3 rounded-xl">
            <span className="text-xs text-slate-400 block">ASN Bekerja WFH:</span>
            <strong className="text-xl font-bold text-emerald-400">{totalWfh} ASN</strong>
          </div>
          <div className="bg-white/5 p-3 rounded-xl">
            <span className="text-xs text-slate-400 block">ASN Bekerja WFO:</span>
            <strong className="text-xl font-bold text-blue-300">{totalWfo} ASN</strong>
          </div>
          <div className="bg-white/5 p-3 rounded-xl">
            <span className="text-xs text-slate-400 block">Batas Kuota 50%:</span>
            <strong className="text-xl font-bold text-amber-300">{Math.floor(totalAsn * 0.5)} Kuota</strong>
          </div>
        </div>
      </div>

      {/* Grid Rasio 4 Bidang BPSDM */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-800">
              Rasio Kehadiran Per Bidang / Unit Kerja
            </h3>
            <p className="text-xs text-slate-500">
              Pemantauan kuota maksimal 50% untuk menjaga operasional tatap muka dan pelatihan di Kampus BPSDM Surabaya.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            4 Bidang Operasional
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quotas.map((quota) => (
            <div
              key={quota.unitKerjaId}
              className={`p-4 rounded-xl border transition ${
                quota.isQuotaExceeded
                  ? 'bg-rose-50/50 border-rose-200'
                  : 'bg-slate-50/80 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{quota.unitKerjaNama}</h4>
                  <span className="text-xs text-slate-500">Total ASN: {quota.totalAsn} orang</span>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  quota.isQuotaExceeded
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : quota.persentaseWfh === 50
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {quota.isQuotaExceeded
                    ? 'Melebihi 50%'
                    : quota.persentaseWfh === 50
                    ? 'Batas Maks 50%'
                    : 'Aman Dibawah 50%'}
                </span>
              </div>

              {/* Progress Bar Kuota */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-600">WFH: {quota.jumlahWfhHariIni} / Maks {quota.maksimalWfh}</span>
                  <span className="font-bold text-slate-800">{quota.persentaseWfh}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      quota.isQuotaExceeded
                        ? 'bg-rose-600'
                        : quota.persentaseWfh === 50
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(quota.persentaseWfh, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stat Footer */}
              <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                <span>WFO Kampus: <strong className="text-slate-700">{quota.jumlahWfoHariIni} ASN</strong></span>
                <span>Sisa Kuota WFH: <strong className="text-slate-700">{quota.kuotaTersediaWfh} Slot</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabel Pengawasan & Permohonan Pengajuan (H-1 & Dispensasi) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-base text-slate-800">
              Daftar Permohonan Fleksibilitas Kerja (FWA) Masuk
            </h3>
            <p className="text-xs text-slate-500">
              Validasi berjenjang oleh Kepala BPSDM untuk permohonan reguler dan permohonan dispensasi melebihi kuota 50%.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
            {fwaRequests.length} Permohonan Tercatat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-y border-slate-200">
              <tr>
                <th className="p-3">Pegawai ASN</th>
                <th className="p-3">Unit Kerja</th>
                <th className="p-3">Tanggal & Jenis</th>
                <th className="p-3">Rencana Target Luaran</th>
                <th className="p-3">Status Permohonan</th>
                <th className="p-3 text-right">Aksi Pimpinan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fwaRequests.slice(0, 8).map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3">
                    <div className="font-bold text-slate-800">{req.asnNama}</div>
                    <div className="text-[10px] font-mono text-slate-400">NIP: {req.asnNip}</div>
                  </td>
                  <td className="p-3 font-medium text-slate-600">
                    {req.unitKerjaId.replace(/_/g, ' ').toUpperCase()}
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-800">{req.tanggal}</div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      req.jenisKerja === 'WFH' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {req.jenisKerja}
                    </span>
                  </td>
                  <td className="p-3 max-w-xs">
                    <div className="truncate font-medium text-slate-700">{req.alasanRencanaKerja}</div>
                    <div className="text-[10px] text-slate-400">
                      {req.rencanaLuaranKinerja?.length || 1} Target Luaran Disertakan
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      req.status === 'DISETUJUI'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'DITOLAK'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {req.status === 'MENUNGGU' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onApproveRequest(req.id, 'DISETUJUI')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px]"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => onApproveRequest(req.id, 'DITOLAK')}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[10px]"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Terverifikasi</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
