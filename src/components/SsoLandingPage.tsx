import React, { useState } from 'react';
import { 
  ShieldCheck, 
  LogIn, 
  UserCheck, 
  Building2, 
  Sparkles, 
  Lock, 
  Clock, 
  FileText, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Laptop,
  Camera
} from 'lucide-react';
import { ASNProfile } from '../types';
import { BpsdmLogo } from './BpsdmLogo';
import { BPSDM_PHOTOS } from '../data/bpsdmAssets';

interface SsoLandingPageProps {
  onLoginSuccess: (profile: ASNProfile) => void;
  onContinueAsGuest: () => void;
  availableProfiles: ASNProfile[];
}

export const SsoLandingPage: React.FC<SsoLandingPageProps> = ({
  onLoginSuccess,
  onContinueAsGuest,
  availableProfiles,
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Filter key personas for quick login
  const kepalaBadan = availableProfiles.find((p) => p.role === 'KEPALA_BPSDM');
  const spbeUser = availableProfiles.find((p) => p.email === 'wahyuprnm6@gmail.com') || availableProfiles.find((p) => p.id === 'asn-sso-user');
  const kepalaUpt = availableProfiles.find((p) => p.unitKerjaId === 'upt_sertifikasi_sdm' && p.role === 'KEPALA_BIDANG');
  const sekretaris = availableProfiles.find((p) => p.unitKerjaId === 'sekretariat' && p.role === 'KEPALA_BIDANG');
  const widyaiswara = availableProfiles.find((p) => p.role === 'WIDYAISWARA');
  const staff = availableProfiles.find((p) => p.role === 'STAFF' && p.id === 'asn-02') || availableProfiles.find((p) => p.role === 'STAFF');

  const handleSimulateGoogleLogin = (profile: ASNProfile) => {
    setIsAuthenticating(true);
    setAuthError(null);
    setTimeout(() => {
      setIsAuthenticating(false);
      onLoginSuccess(profile);
    }, 600);
  };

  const handleCustomEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) {
      setAuthError('Silakan masukkan alamat email Google (@jatimprov.go.id atau @gmail.com)');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    setTimeout(() => {
      setIsAuthenticating(false);
      const matched = availableProfiles.find(
        (p) => p.email.toLowerCase() === customEmail.trim().toLowerCase()
      );

      if (matched) {
        onLoginSuccess(matched);
      } else {
        // Create dynamic SSO profile for email
        const isHead = customEmail.toLowerCase().includes('kepala') || customEmail.toLowerCase().includes('ramliyanto');
        const dynamicProfile: ASNProfile = {
          id: `sso-${Date.now()}`,
          nip: '198905202014031002',
          nama: customEmail.split('@')[0].replace('.', ' ').toUpperCase() + ', S.STP',
          jabatan: isHead ? 'Kepala Badan Pengembangan Sumber Daya Manusia' : 'Aparatur Sipil Negara / Peserta Fleksibilitas Kedinasan',
          unitKerjaId: 'sekretariat',
          subBidang: 'Sekretariat BPSDM Jawa Timur',
          role: isHead ? 'KEPALA_BPSDM' : 'STAFF',
          email: customEmail.trim(),
          statusHariIni: 'WFH',
          pangkatGolongan: isHead ? 'Pembina Utama (IV/e)' : 'Penata (III/c)',
        };
        onLoginSuccess(dynamicProfile);
      }
    }, 700);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Bar / Government Header with BpsdmLogo */}
      <header className="border-b border-slate-700/60 bg-slate-900/90 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between">
        <BpsdmLogo variant="compact" lightText={true} />

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            LMS Si-Praja & Google Workspace Aktif
          </span>
          <button
            onClick={onContinueAsGuest}
            className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5"
          >
            <span>Mode Tamu</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Context, Policy Highlights & SOTK */}
          <div className="lg:col-span-6 space-y-6">
            {/* Regulatory Badges */}
            <div className="inline-flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                SE NO. 800/1141/204/2026
              </div>
              <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold px-3 py-1 rounded-full">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                SOTK PERGUB JATIM NO. 71/2023
              </div>
              <div className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full">
                WFA HINGGA 100%
              </div>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/95 rounded-2xl p-1.5 shadow-xl border-2 border-orange-400/60 flex items-center justify-center shrink-0">
                  <BpsdmLogo variant="icon" size={68} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-extrabold tracking-wider uppercase text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-700/60">
                      PORTAL TUNGGAL APARATUR SIPIL NEGARA
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    <span className="text-orange-400 font-bold">BPSDM Jawa Timur</span> • Kampus Balongsari Surabaya
                  </div>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight flex flex-col gap-1">
                <span>BPSDM ONE</span>
                <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-teal-200 to-amber-300 text-2xl sm:text-3xl lg:text-4xl font-extrabold">
                  Provinsi Jawa Timur
                </span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                Pusat kendali operasional virtual office, single sign-on Google ASN, pemantauan presensi 3 kali sehari, pelaporan kinerja SKP, serta manajemen terpadu 5 unit kerja kediklatan Jawa Timur.
              </p>
            </div>

            {/* 3 Core Mandates under SE 800/1141/204/2026 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5 backdrop-blur-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                  <Laptop className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">WFA Hingga 100%</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Fleksibilitas penuh BPSDM didukung LMS Si-Praja & Google Workspace.
                </div>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5 backdrop-blur-xs">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">Presensi 3x Sehari</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Presensi Masuk (07.30), Siang (12.00-13.00), & Pulang (16.00).
                </div>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5 backdrop-blur-xs">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">Eviden SKP Terukur</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Minimal 2 target luaran harian dengan bukti digital Google Drive.
                </div>
              </div>
            </div>

            {/* SOTK Reference: 5 Units under Pergub 71/2023 */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3.5 text-xs space-y-1.5">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                5 Unit Kerja SOTK Terintegrasi (Pergub Jatim No. 71/2023):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-[11px] text-slate-300">
                <span className="truncate">• 1. Sekretariat BPSDM</span>
                <span className="truncate">• 2. Bidang PK Dasar & Manajerial</span>
                <span className="truncate">• 3. Bidang PK Fungsional & Soskul</span>
                <span className="truncate">• 4. Bidang PK Teknis (PKT)</span>
                <span className="col-span-2 sm:col-span-2 text-emerald-300 font-medium truncate">
                  • 5. UPT Sertifikasi Kompetensi SDM (Kampus Balongsari)
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Google SSO Authentication Card */}
          <div className="lg:col-span-6">
            <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
              {/* SSO Header */}
              <div className="text-center pb-6 border-b border-slate-100">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs mb-3">
                  {/* Official Google 'G' Icon */}
                  <svg className="w-7 h-7" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Single Sign-On (Google SSO)
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Gunakan akun resmi Google Workspace Pemprov Jatim (@jatimprov.go.id) atau akun Google kedinasan yang terdaftar di BPSDM ONE.
                </p>
              </div>

              {/* Custom Google Email Entry Form */}
              <form onSubmit={handleCustomEmailLogin} className="mt-5 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Akun Google ASN:
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="nama.pegawai@jatimprov.go.id atau wahyuprnm6@gmail.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium transition"
                    />
                  </div>
                </div>

                {authError && (
                  <div className="text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 p-2 rounded-lg">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  {isAuthenticating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Memverifikasi dengan Google Identity Services...
                    </span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Masuk Menggunakan Akun Google</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick SSO Persona Switcher (For Ease of Testing / Direct Access) */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-800">
                    Pilih Akses Cepat Pegawai BPSDM:
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    1-Click Instant SSO
                  </span>
                </div>

                <div className="space-y-2">
                  {/* 1. Kepala BPSDM */}
                  {kepalaBadan && (
                    <button
                      onClick={() => handleSimulateGoogleLogin(kepalaBadan)}
                      className="w-full text-left p-3 rounded-xl border border-amber-200/80 bg-linear-to-r from-amber-50 to-orange-50/50 hover:border-amber-400 hover:shadow-xs transition group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          RB
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-amber-900 flex items-center gap-1.5">
                            {kepalaBadan.nama}
                            <span className="text-[9px] bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.2 rounded">
                              KEPALA BADAN
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {kepalaBadan.email} • Tampilan Command Center Eksekutif & Manajemen Pegawai
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition" />
                    </button>
                  )}

                  {/* 2. SPBE Team Member (User Wahyu Ramadhany) */}
                  {spbeUser && (
                    <button
                      onClick={() => handleSimulateGoogleLogin(spbeUser)}
                      className="w-full text-left p-3 rounded-xl border border-blue-200/80 bg-linear-to-r from-blue-50 to-indigo-50/50 hover:border-blue-400 hover:shadow-xs transition group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          WR
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900 flex items-center gap-1.5">
                            {spbeUser.nama}
                            <span className="text-[9px] bg-blue-200 text-blue-900 font-extrabold px-1.5 py-0.2 rounded">
                              TIM SPBE
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {spbeUser.email} • Pranata Komputer Ahli Muda
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition" />
                    </button>
                  )}

                  {/* 3. Kepala UPT SKSDM Kampus Balongsari Surabaya */}
                  {kepalaUpt && (
                    <button
                      onClick={() => handleSimulateGoogleLogin(kepalaUpt)}
                      className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                          SR
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800">
                            {kepalaUpt.nama}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Kepala UPT Sertifikasi Kompetensi SDM (Kampus Balongsari Surabaya)
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                    </button>
                  )}

                  {/* 4. Sekretaris BPSDM */}
                  {sekretaris && (
                    <button
                      onClick={() => handleSimulateGoogleLogin(sekretaris)}
                      className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center">
                          ZA
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800">
                            {sekretaris.nama}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Sekretaris BPSDM Jawa Timur
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Direct Guest Link */}
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 underline decoration-slate-300 underline-offset-4"
                >
                  Atau langsung tinjau Command Center BPSDM ONE tanpa akun &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Showcase: Foto Kampus Balongsari Surabaya & Kediklatan */}
        <div className="border-t border-slate-800/80 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                <span>DOKUMENTASI FASILITAS & KEGIATAN KEDIKLATAN BPSDM JATIM</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Kampus Utama Balongsari Surabaya & Smart Campus
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Mendukung operasional kedinasan tatap muka (WFO) maupun jarak jauh (WFA)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BPSDM_PHOTOS.slice(0, 4).map((photo) => (
              <div
                key={photo.id}
                className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden group hover:border-emerald-500/60 transition shadow-lg flex flex-col justify-between"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-slate-950">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                    {photo.tag}
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition line-clamp-1">
                      {photo.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {photo.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center gap-1 text-[10px] text-slate-400">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{photo.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/90 py-4 px-4 sm:px-8 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          &copy; {new Date().getFullYear()} BPSDM ONE • Badan Pengembangan Sumber Daya Manusia Provinsi Jawa Timur
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span>SPBE Terintegrasi</span>
          <span>•</span>
          <span>SE No. 800/1141/204/2026</span>
          <span>•</span>
          <span>Pergub Jatim No. 71/2023</span>
        </div>
      </footer>
    </div>
  );
};

