import React from 'react';

interface BpsdmLogoProps {
  variant?: 'header' | 'full' | 'icon' | 'compact' | 'mascotOnly';
  className?: string;
  lightText?: boolean;
  size?: number;
}

/**
 * Komponen Logo Resmi BPSDM Provinsi Jawa Timur
 * Maskot Resmi: Sang Ganesha Berpeci Kedinasan dengan Lencana BPSDM Jatim,
 * Membawa Bendera Merah Putih, dengan Tipografi Ikonik "BPSDM" (Orange) & "Jatim" (Blue Script).
 */
export const BpsdmLogo: React.FC<BpsdmLogoProps> = ({
  variant = 'header',
  className = '',
  lightText = true,
  size,
}) => {
  // SVG Maskot Ganesha BPSDM Jawa Timur
  const MascotSvg = ({ dimension = 48 }: { dimension?: number }) => (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-md select-none"
    >
      <defs>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2A662" />
          <stop offset="60%" stopColor="#C98843" />
          <stop offset="100%" stopColor="#A86B2A" />
        </linearGradient>
        <linearGradient id="capGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="50%" stopColor="#15803D" />
          <stop offset="100%" stopColor="#14532D" />
        </linearGradient>
        <linearGradient id="flagRedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="60%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>
        <linearGradient id="braceletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
        <linearGradient id="orangeTypoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF7A00" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <filter id="logoGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.2" />
        </filter>
      </defs>

      <g filter="url(#logoGlow)">
        {/* 1. Telinga Lebar Kiri & Kanan */}
        <path
          d="M 200 100 C 130 90, 80 130, 95 190 C 105 230, 150 240, 185 205 C 190 200, 195 160, 200 140 Z"
          fill="url(#bodyGrad)"
          stroke="#1C140D"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path
          d="M 125 150 C 120 190, 150 205, 175 185"
          fill="none"
          stroke="#8C5018"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 300 100 C 370 90, 420 130, 405 190 C 395 230, 350 240, 315 205 C 310 200, 305 160, 300 140 Z"
          fill="url(#bodyGrad)"
          stroke="#1C140D"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path
          d="M 375 150 C 380 190, 350 205, 325 185"
          fill="none"
          stroke="#8C5018"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* 2. Kaki Bersila (Padmasana) */}
        <path
          d="M 130 220 C 100 240, 95 290, 140 315 C 180 335, 230 320, 250 280 C 230 260, 170 240, 130 220 Z"
          fill="url(#bodyGrad)"
          stroke="#1C140D"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path
          d="M 370 220 C 400 240, 405 290, 360 315 C 320 335, 270 320, 250 280 C 270 260, 330 240, 370 220 Z"
          fill="url(#bodyGrad)"
          stroke="#1C140D"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Telapak Kaki Menghadap Depan */}
        <path
          d="M 235 285 C 230 310, 215 340, 230 355 C 245 340, 250 310, 245 285 Z"
          fill="url(#bodyGrad)"
          stroke="#1C140D"
          strokeWidth="5"
        />
        <path
          d="M 265 285 C 270 310, 285 340, 270 355 C 255 340, 250 310, 255 285 Z"
          fill="url(#bodyGrad)"
          stroke="#1C140D"
          strokeWidth="5"
        />

        {/* Gelang Kaki Manik Biru */}
        <g fill="url(#braceletGrad)" stroke="#0F172A" strokeWidth="2">
          <ellipse cx="238" cy="285" rx="14" ry="5" />
          <ellipse cx="262" cy="285" rx="14" ry="5" />
        </g>

        {/* 3. Tubuh & Perut Bulat */}
        <ellipse cx="250" cy="210" rx="65" ry="60" fill="url(#bodyGrad)" stroke="#1C140D" strokeWidth="6" />

        {/* 4. Lengan dengan Gelang Biru & Bunga Teratai / Modak */}
        <path
          d="M 160 170 C 130 190, 120 225, 155 235 C 175 240, 195 210, 190 190 Z"
          fill="url(#bodyGrad)"
          stroke="#1C140D"
          strokeWidth="6"
        />
        <ellipse cx="140" cy="188" rx="13" ry="6" transform="rotate(35 140 188)" fill="url(#braceletGrad)" stroke="#0F172A" strokeWidth="2" />
        <path d="M 130 195 C 115 190, 120 165, 140 175 C 150 180, 145 205, 130 195 Z" fill="#FFFFFF" stroke="#1C140D" strokeWidth="4" />

        <path
          d="M 340 170 C 370 190, 380 225, 345 235 C 325 240, 305 210, 310 190 Z"
          fill="url(#bodyGrad)"
          stroke="#1C140D"
          strokeWidth="6"
        />
        <ellipse cx="360" cy="188" rx="13" ry="6" transform="rotate(-35 360 188)" fill="url(#braceletGrad)" stroke="#0F172A" strokeWidth="2" />
        <path d="M 370 195 C 385 190, 380 165, 360 175 C 350 180, 355 205, 370 195 Z" fill="#FFFFFF" stroke="#1C140D" strokeWidth="4" />

        {/* 5. Bendera Merah Putih Selempang Dada */}
        <path
          d="M 170 230 Q 230 200 320 160 L 310 180 Q 220 220 150 250 Z"
          fill="url(#flagRedGrad)"
          stroke="#1C140D"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M 150 250 Q 220 220 310 180 L 305 202 Q 215 242 145 272 Z"
          fill="#FFFFFF"
          stroke="#1C140D"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        {/* 6. Kepala Ganesha */}
        <circle cx="250" cy="140" r="58" fill="url(#bodyGrad)" stroke="#1C140D" strokeWidth="6" />

        {/* Mata & Alis Ramah */}
        <ellipse cx="228" cy="115" rx="3.5" ry="4.5" fill="#1C140D" />
        <path d="M 218 107 C 224 102, 234 104, 238 108" fill="none" stroke="#1C140D" strokeWidth="3.5" strokeLinecap="round" />
        <ellipse cx="272" cy="115" rx="3.5" ry="4.5" fill="#1C140D" />
        <path d="M 282 107 C 276 102, 266 104, 262 108" fill="none" stroke="#1C140D" strokeWidth="3.5" strokeLinecap="round" />

        {/* 7. Belalai (Trunk) */}
        <path
          d="M 242 125 C 240 150, 235 180, 245 205 C 255 230, 285 225, 290 200 C 292 185, 280 180, 275 190 C 270 200, 258 200, 256 185 C 252 165, 258 145, 258 125 Z"
          fill="url(#bodyGrad)"
          stroke="#1C140D"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path d="M 244 148 Q 250 152 256 148" fill="none" stroke="#8C5018" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 243 162 Q 250 166 256 162" fill="none" stroke="#8C5018" strokeWidth="3.5" strokeLinecap="round" />

        {/* 8. Tanda Dahi (Tilak Ganesha) */}
        <g transform="translate(250, 96)">
          <rect x="-11" y="-5" width="22" height="10" rx="3" fill="none" stroke="#1C140D" strokeWidth="3" />
          <circle cx="0" cy="0" r="3" fill="#FFB703" />
          <line x1="-7" y1="0" x2="-3" y2="0" stroke="#1C140D" strokeWidth="2" strokeLinecap="round" />
          <line x1="3" y1="0" x2="7" y2="0" stroke="#1C140D" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* 9. Topi Pet Kedinasan BPSDM Warna Hijau */}
        <path
          d="M 185 86 C 190 35, 310 35, 315 86 Z"
          fill="url(#capGrad)"
          stroke="#1C140D"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path
          d="M 175 84 C 210 92, 290 92, 325 84 C 330 94, 305 102, 250 102 C 195 102, 170 94, 175 84 Z"
          fill="#14532D"
          stroke="#1C140D"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        {/* Lencana Pin BPSDM Jawa Timur di Depan Topi */}
        <g transform="translate(250, 64)">
          <circle cx="0" cy="0" r="21" fill="#EA580C" stroke="#1C140D" strokeWidth="4" />
          <circle cx="0" cy="0" r="16" fill="#FFFBEB" stroke="#B45309" strokeWidth="2" />
          {/* Lambang Pemprov Jawa Timur */}
          <path d="M 0 -10 C 5 -10, 9 -7, 9 -2 C 9 6, 5 10, 0 12 C -5 10, -9 6, -9 -2 C -9 -7, -5 -10, 0 -10 Z" fill="#0284C7" />
          <polygon points="0,-6 5,4 -5,4" fill="#047857" />
          <polygon points="0,-8 1,-6 3,-6 1.5,-4.5 2,-2.5 0,-3.5 -2,-2.5 -1.5,-4.5 -3,-6 -1,-6" fill="#FACC15" />
        </g>
      </g>

      {/* 10. Tipografi BPSDM Jatim */}
      <g transform="translate(250, 400)">
        <text
          x="0"
          y="0"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="68"
          letterSpacing="1"
          fill="url(#orangeTypoGrad)"
          stroke="#9A3412"
          strokeWidth="3"
          transform="skewX(-6)"
        >
          BPSDM
        </text>
        {/* Teks Script Biru "Jatim" */}
        <g transform="translate(45, 42)">
          <path
            d="M -5 -38 C -4 -42, 6 -42, 8 -36 C 9 -30, 3 -16, 2 0 C 0 16, -10 24, -20 22 C -28 20, -26 10, -18 8 C -10 6, -3 10, 0 2"
            fill="none"
            stroke="#1D4ED8"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <ellipse cx="28" cy="-28" rx="4" ry="5" fill="#1D4ED8" />
          <path
            d="M 5 -12 C 12 -12, 16 -18, 16 -24 C 16 -30, 8 -30, 4 -22 C 0 -14, 4 -4, 14 -4 C 20 -4, 25 -10, 25 -18 L 26 -6 C 27 -2, 29 0, 34 0 L 38 -34 M 31 -22 L 46 -22 M 38 -6 C 42 0, 48 0, 52 -8 M 46 -20 L 46 -6 C 47 0, 50 0, 54 -6 M 54 -20 L 54 -6 C 55 2, 60 4, 68 -2 L 68 -18 L 68 -6 C 69 2, 75 4, 82 -4"
            fill="none"
            stroke="#1D4ED8"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M -15 28 C 10 32, 50 28, 88 16" fill="none" stroke="#2563EB" strokeWidth="5" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );

  // 1. Icon Only
  if (variant === 'icon') {
    return <MascotSvg dimension={size || 48} />;
  }

  // 2. Mascot Only (Besar / Hero Showcase)
  if (variant === 'mascotOnly') {
    return (
      <div className={`inline-flex flex-col items-center ${className}`}>
        <MascotSvg dimension={size || 140} />
      </div>
    );
  }

  // 3. Compact mode (small navbars or chips)
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <div className="w-9 h-9 rounded-xl bg-white/90 p-0.5 shadow-sm border border-amber-500/30 flex items-center justify-center shrink-0">
          <MascotSvg dimension={34} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-sm tracking-tight text-white">BPSDM ONE</span>
            <span className="text-[9px] bg-orange-500/30 text-orange-300 font-bold px-1.5 py-0.2 rounded border border-orange-400/40">
              JATIM
            </span>
          </div>
          <div className="text-[10px] text-slate-400 leading-none">Jawa Timur Corporate University</div>
        </div>
      </div>
    );
  }

  // 4. Full mode (Landing Page & Hero Screens)
  if (variant === 'full') {
    return (
      <div className={`flex flex-col sm:flex-row items-center gap-5 ${className}`}>
        <div className="relative shrink-0">
          <div className="absolute -inset-2 rounded-3xl bg-linear-to-r from-orange-500 via-amber-400 to-emerald-500 opacity-60 blur-xs animate-pulse" />
          <div className="relative bg-white/95 rounded-3xl p-2.5 border-2 border-orange-400/60 shadow-2xl flex items-center justify-center">
            <MascotSvg dimension={size || 96} />
          </div>
        </div>
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-extrabold px-3 py-1 rounded-full mb-1.5">
            <span>PEMERINTAH PROVINSI JAWA TIMUR</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>KAMPUS BALONGSARI SURABAYA</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="text-orange-500">BPSDM</span>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-teal-300 to-amber-300">
                ONE
              </span>
            </h1>
            <span className="text-[11px] font-black bg-linear-to-r from-orange-500 to-amber-500 text-slate-950 px-2.5 py-0.5 rounded-lg shadow-sm">
              SUPER APP
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium mt-1 max-w-lg leading-relaxed">
            Portal Komando Virtual Office, Fleksibilitas Kedinasan (WFA Hingga 100%), Presensi 3x Sehari, & Kinerja Diklat ASN Jawa Timur
          </p>
        </div>
      </div>
    );
  }

  // 5. Default Header mode
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-white/95 p-1 shadow-md flex items-center justify-center border border-orange-400/50">
          <MascotSvg dimension={44} />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
            <span className="text-orange-500">BPSDM</span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-300 via-teal-200 to-amber-300">
              ONE
            </span>
          </span>
          <span className="bg-orange-500/20 text-orange-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-500/40">
            JATIM
          </span>
          <span className="hidden sm:inline-block text-[9px] bg-emerald-500/20 text-emerald-300 font-semibold px-1.5 py-0.2 rounded border border-emerald-500/30">
            SE 800/1141/204/2026
          </span>
        </div>
        <div className={`text-[11px] font-medium ${lightText ? 'text-slate-300' : 'text-slate-600'} leading-tight truncate`}>
          Badan Pengembangan Sumber Daya Manusia Provinsi Jawa Timur
        </div>
      </div>
    </div>
  );
};
