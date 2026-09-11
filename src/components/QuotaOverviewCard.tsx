import React from 'react';
import { QuotaCalculation, UnitKerjaId } from '../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Building, 
  Home, 
  AlertTriangle, 
  ArrowUpRight,
  Info
} from 'lucide-react';

interface QuotaOverviewCardProps {
  quotas: QuotaCalculation[];
  overallWfhPercentage: number;
  totalAsn: number;
  totalWfh: number;
  totalWfo: number;
  onApplyFwa: (unitId?: UnitKerjaId) => void;
  selectedDate: string;
}

export const QuotaOverviewCard: React.FC<QuotaOverviewCardProps> = ({
  quotas,
  overallWfhPercentage,
  totalAsn,
  totalWfh,
  totalWfo,
  onApplyFwa,
  selectedDate,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              Monitoring Fleksibilitas Tugas Kedinasan (WFA Hingga 100%) & Kesiapsiagaan Kampus Diklat
            </h2>
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              SE NO. 800/1141/204/2026
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Merujuk Surat Edaran Gubernur Jatim No. 800/1141/204/2026 dan Pergub No. 71/2023, BPSDM Jatim diperkenankan alokasi WFA hingga <span className="font-semibold text-emerald-700">maksimal 100%</span> pada tanggal{' '}
            <span className="font-semibold text-slate-700">{selectedDate}</span> dengan kewajiban presensi 3x sehari dan luaran SKP digital.
          </p>
        </div>

        {/* Global Summary Badge & Action */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-right">
            <div className="text-[11px] text-slate-500">Rasio WFA Global BPSDM</div>
            <div className="text-sm font-bold text-slate-800 flex items-center justify-end gap-1.5">
              <span>{totalWfh} / {totalAsn} ASN</span>
              <span className="text-xs px-1.5 py-0.2 rounded font-semibold bg-emerald-100 text-emerald-800">
                {overallWfhPercentage}%
              </span>
            </div>
          </div>

          <button
            id="btn-apply-fwa-primary"
            onClick={() => onApplyFwa()}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2.5 rounded-lg shadow transition"
          >
            <span>Ajukan WFA / WFH</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of 5 Work Units (SOTK Pergub 71/2023) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-5">
        {quotas.map((item) => {
          const isAtLimit = item.jumlahWfhHariIni >= item.maksimalWfh;
          const isNearLimit = !isAtLimit && item.jumlahWfhHariIni >= item.maksimalWfh * 0.8;

          return (
            <div
              key={item.unitKerjaId}
              className={`rounded-xl p-4 border transition ${
                isAtLimit
                  ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-200'
                  : isNearLimit
                  ? 'bg-amber-50/40 border-amber-300'
                  : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Unit Title & Status Badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 leading-tight">
                    {item.unitKerjaNama}
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>Total Pegawai: {item.totalAsn} ASN</span>
                  </div>
                </div>

                {isAtLimit ? (
                  <span className="shrink-0 inline-flex items-center gap-1 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    <ShieldAlert className="w-3 h-3" />
                    KUOTA PENUH
                  </span>
                ) : isNearLimit ? (
                  <span className="shrink-0 inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    SIAGA
                  </span>
                ) : (
                  <span className="shrink-0 inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    TERSEDIA
                  </span>
                )}
              </div>

              {/* Progress Bar Gauge */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="text-slate-600">WFH Hari Ini:</span>
                  <span className={`font-bold ${isAtLimit ? 'text-rose-700' : 'text-slate-800'}`}>
                    {item.jumlahWfhHariIni} / {item.maksimalWfh} ASN ({item.persentaseWfh}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isAtLimit
                        ? 'bg-rose-500'
                        : isNearLimit
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, (item.jumlahWfhHariIni / item.maksimalWfh) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0%</span>
                  <span className="font-semibold text-slate-500">Kuota Fleksibel Hingga 100%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Detail Metrics Footer */}
              <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-200/60 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Building className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-[10px] block text-slate-400">WFO Kampus</span>
                    <span className="font-bold text-slate-800">{item.jumlahWfoHariIni} ASN</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-600">
                  <Home className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] block text-slate-400">Slot WFA Tersedia</span>
                    <span className="font-bold text-emerald-700">
                      {item.kuotaTersediaWfh} Slot
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button Per Unit */}
              <div className="mt-3 pt-2 border-t border-slate-200/60">
                <button
                  id={`btn-apply-unit-${item.unitKerjaId}`}
                  onClick={() => onApplyFwa(item.unitKerjaId)}
                  className="w-full py-1.5 px-2 rounded text-[11px] font-semibold text-center transition flex items-center justify-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs"
                >
                  Ajukan WFA di Unit Ini
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Regulatory Context Footer Note */}
      <div className="mt-4 p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-lg flex items-start gap-2 text-xs text-emerald-950">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Ketentuan SURAT EDARAN NOMOR 800/1141/204/2026:</span> BPSDM Provinsi Jawa Timur memperoleh alokasi fleksibilitas tugas kedinasan (WFA) hingga 100% dari total ASN. ASN yang melaksanakan WFA wajib presensi digital 3 kali sehari (Pagi, Siang, Pulang) dan melaporkan luaran SKP harian ber-eviden Google Drive. Seluruh unit kerja di Kampus Balongsari Surabaya beroperasi terpadu melalui SPBE Si-Praja.
        </div>
      </div>
    </div>
  );
};
