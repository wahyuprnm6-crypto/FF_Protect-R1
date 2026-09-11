import React, { useState } from 'react';
import { 
  Monitor, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Maximize2, 
  Layers, 
  ShieldCheck, 
  FileText, 
  Users, 
  Award,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { ASNProfile } from '../../types';

interface VirtualScreenShareProps {
  presenter: ASNProfile;
  onStopShare?: () => void;
  isCurrentUserPresenter: boolean;
}

export const VirtualScreenShare: React.FC<VirtualScreenShareProps> = ({
  presenter,
  onStopShare,
  isCurrentUserPresenter,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>({ x: 50, y: 50 });

  const slides = [
    {
      title: 'PAPARAN STRATEGIS: TRANSFORMAZ DIGITAL KEDIKLATAN BPSDM PROVINSI JAWA TIMUR TAHUN 2026',
      subtitle: 'Implementasi SE Gubernur No. 800/1141/204/2026 & Peraturan Gubernur Jawa Timur No. 71 Tahun 2023',
      section: 'BPSDM KAMPUS UTAMA BALONGSARI SURABAYA',
      points: [
        {
          heading: 'Fleksibilitas Tugas Kedinasan (WFA hingga 100%)',
          desc: 'BPSDM Jatim beroperasi secara modern dengan fleksibilitas lokasi kerja berbasis luaran kinerja terukur (PermenPANRB No. 6/2022).',
          tag: 'Regulasi Resmi',
          status: 'TERPENUHI',
        },
        {
          heading: 'Disiplin Presensi Digital 3 Kali Sehari',
          desc: 'Validasi live GPS terdistribusi: Pukul 07.30 WIB (Pagi/Masuk), Pukul 12.00–13.00 WIB (Siang), dan Pukul 16.00 WIB (Sore/Pulang).',
          tag: 'Presensi SPBE',
          status: 'TERVERIFIKASI',
        },
        {
          heading: 'Akuntabilitas Bukti Eviden Google Drive',
          desc: 'Setiap ASN wajib melampirkan minimal 2 target luaran kinerja per hari yang tersinkronisasi dengan repositori awan BPSDM Jatim.',
          tag: 'Google Workspace',
          status: 'AKTIF',
        },
      ],
      footnote: 'Penyaji: ' + presenter.nama + ' (' + presenter.jabatan + ')',
    },
    {
      title: 'AGENDA & KALENDER PEMBELAJARAN KEPEMIMPINAN (PKN II, PKA, & PKP) TAHUN 2026',
      subtitle: 'Bidang Pengembangan Kompetensi Manajerial & Bidang Fungsional Soskul',
      section: 'SINKRONISASI MODUL & WIDYAISWARA',
      points: [
        {
          heading: 'Pelatihan Kepemimpinan Nasional (PKN) Tingkat II',
          desc: 'Penyusunan Proyek Perubahan (Proper) strategis pimpinan OPD se-Jawa Timur berbasis inovasi pelayanan publik.',
          tag: 'PK Manajerial',
          status: 'BERJALAN',
        },
        {
          heading: 'Internalisasi Core Values ASN BerAKHLAK',
          desc: 'Sosialisasi budaya kerja Berorientasi Pelayanan, Akuntabel, Kompeten, Harmonis, Loyal, Adaptif, dan Kolaboratif.',
          tag: 'Sosial Kultural',
          status: 'TERJADWAL',
        },
        {
          heading: 'Sertifikasi Asesor Kompetensi SDM (LSP BPSDM Jatim)',
          desc: 'Uji sertifikasi kompetensi aparatur di Kampus Utama Balongsari Surabaya berstandar Badan Nasional Sertifikasi Profesi (BNSP).',
          tag: 'UPT Mutu SDM',
          status: 'SIAP UJI',
        },
      ],
      footnote: 'Platform Virtual Office Terintegrasi SPBE • Si-Praja LMS',
    },
    {
      title: 'DASBOR OPERASIONAL & PENGAWASAN LANGSUNG KEPALA BPSDM PROVINSI JAWA TIMUR',
      subtitle: 'Pemantauan Real-time 5 Unit Kerja SOTK dan Distribusi Beban Kerja Pegawai',
      section: 'PUSAT KOMANDO (COMMAND CENTER)',
      points: [
        {
          heading: 'Integrasi Ekosistem Google Workspace',
          desc: 'Kolaborasi tanpa jeda menggunakan Google Meet HD, Google Drive Eviden, dan Google Calendar Kediklatan resmi Pemprov Jatim.',
          tag: 'Infrastruktur IT',
          status: 'STABIL 99.9%',
        },
        {
          heading: 'Transparansi Kinerja Terpadu',
          desc: 'Verifikasi atasan berjenjang memastikan mutu pelayanan diklat tetap prima baik dari kantor maupun dari kediaman.',
          tag: 'SPBE Mandiri',
          status: 'TERPANTAU',
        },
      ],
      footnote: 'Motto BPSDM Jatim: "Jer Basuki Mawa Beya" - Sukses Butuh Pengorbanan & Dedikasi Nyata',
    },
  ];

  const currentSlide = slides[currentSlideIndex];

  // Laser pointer movement handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLaserPos({ x, y });
  };

  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[460px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Top Banner: Presenter Info */}
      <div className="bg-slate-900/95 backdrop-blur-md px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-white z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 animate-pulse">
            <Monitor className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold">
              <span>Layar Bersama: {presenter.nama}</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/40">
                LIVE SHARE
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              {presenter.jabatan} • Slide {currentSlideIndex + 1} dari {slides.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Slide Navigation */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentSlideIndex === 0}
              className="p-1 text-slate-300 hover:text-white disabled:opacity-30 transition rounded"
              title="Slide Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-300">
              {currentSlideIndex + 1} / {slides.length}
            </span>
            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="p-1 text-slate-300 hover:text-white disabled:opacity-30 transition rounded"
              title="Slide Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {isCurrentUserPresenter && onStopShare && (
            <button
              onClick={onStopShare}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition shadow-xs"
            >
              Hentikan Berbagi
            </button>
          )}
        </div>
      </div>

      {/* Main Slide Canvas with Laser Pointer */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setLaserPos(null)}
        className="relative flex-1 p-6 sm:p-10 bg-linear-to-br from-slate-900 via-slate-950 to-blue-950 text-white flex flex-col justify-between select-none cursor-crosshair overflow-auto"
      >
        {/* Decorative Watermark & Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="absolute top-4 right-6 text-right opacity-30 pointer-events-none">
          <span className="text-4xl sm:text-6xl font-black text-slate-700 tracking-wider">
            BPSDM JATIM
          </span>
        </div>

        {/* Laser pointer dot */}
        {laserPos && (
          <div
            className="absolute pointer-events-none z-30 transition-all duration-75"
            style={{ left: `${laserPos.x}%`, top: `${laserPos.y}%` }}
          >
            <div className="w-3.5 h-3.5 -ml-1.5 -mt-1.5 bg-rose-500 rounded-full shadow-[0_0_12px_#f43f5e] animate-ping opacity-75" />
            <div className="w-2.5 h-2.5 -ml-1.25 -mt-1.25 bg-rose-400 rounded-full shadow-[0_0_8px_#f43f5e]" />
          </div>
        )}

        {/* Slide Header */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold mb-3 tracking-wide">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>{currentSlide.section}</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black tracking-tight text-slate-100 max-w-3xl leading-snug">
            {currentSlide.title}
          </h2>
          <p className="text-xs sm:text-sm text-cyan-300/90 font-medium mt-1">
            {currentSlide.subtitle}
          </p>
        </div>

        {/* Slide Content Points */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {currentSlide.points.map((pt, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 backdrop-blur-md hover:border-cyan-400/60 transition shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {pt.tag}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {pt.status}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white leading-tight">
                  {pt.heading}
                </h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {pt.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Poin #{idx + 1}</span>
                <span className="text-cyan-400 font-mono">SE 800/1141/204/2026</span>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Footer */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="italic">{currentSlide.footnote}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>SPBE BPSDM ONE PROV JATIM</span>
            <span className="text-amber-400">STATUS: TERENKRIPSI</span>
          </div>
        </div>
      </div>
    </div>
  );
};
