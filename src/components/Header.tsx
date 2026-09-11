import React from 'react';
import { ASNProfile, GoogleWorkspaceState, UserMode } from '../types';
import { 
  Building2, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  UserCheck, 
  LogOut, 
  Sparkles, 
  FolderSync,
  Shield,
  User,
  Crown,
  Camera,
  UserCog
} from 'lucide-react';
import { BpsdmLogo } from './BpsdmLogo';

interface HeaderProps {
  currentAsn: ASNProfile;
  allAsn: ASNProfile[];
  onSelectAsn: (asn: ASNProfile) => void;
  workspaceState: GoogleWorkspaceState;
  userMode: UserMode;
  onSelectUserMode: (mode: UserMode) => void;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  onOpenWorkspaceModal: () => void;
  onOpenSsoModal: () => void;
  onOpenAiAdvisor: () => void;
  onOpenAppsScriptModal: () => void;
  onSwitchAccountToLandingPage?: () => void;
  onOpenGallery?: () => void;
  onOpenManageAsn?: () => void;
  onOpenMetaverse?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentAsn,
  allAsn,
  onSelectAsn,
  workspaceState,
  userMode,
  onSelectUserMode,
  onGoogleSignIn,
  onGoogleSignOut,
  onOpenWorkspaceModal,
  onOpenSsoModal,
  onOpenAiAdvisor,
  onOpenAppsScriptModal,
  onSwitchAccountToLandingPage,
  onOpenGallery,
  onOpenManageAsn,
  onOpenMetaverse,
}) => {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Top Banner: Pemprov Jatim & SPBE Identity */}
      <div className="bg-emerald-950 text-emerald-100 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-emerald-800/60">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wide text-emerald-300">
            PEMERINTAH PROVINSI JAWA TIMUR
          </span>
          <span className="text-emerald-400/60">•</span>
          <span className="hidden sm:inline text-emerald-200">
            Aplikasi Terpadu BPSDM ONE (SPBE BPSDM Jatim)
          </span>
          <span className="text-emerald-400/60 hidden sm:inline">•</span>
          <span className="hidden md:inline font-mono text-emerald-300 italic">
            "Jer Basuki Mawa Beya"
          </span>
        </div>
        <div className="flex items-center gap-3 font-medium">
          <span className="inline-flex items-center gap-1 bg-emerald-800/80 px-2 py-0.5 rounded text-[11px] text-emerald-200 border border-emerald-700/50">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            SE No. 800/1141/204/2026 (WFA 100%) & Pergub Jatim No. 71/2023
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded">
            ASN BerAKHLAK
          </span>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Logo & Agency Name */}
        <BpsdmLogo variant="header" lightText={true} />

        {/* Action Controls, User Switcher, & Google Workspace */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Gallery Button */}
          {onOpenGallery && (
            <button
              id="btn-header-gallery"
              onClick={onOpenGallery}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 transition shadow-xs"
              title="Lihat Galeri Foto Kampus Balongsari Surabaya"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Galeri Foto Kampus</span>
            </button>
          )}

          {/* Quick ASN Management Button for Kepala BPSDM */}
          {(userMode === 'PIMPINAN_KEPALA_BPSDM' || currentAsn.role === 'KEPALA_BPSDM') && onOpenManageAsn && (
            <button
              id="btn-header-manage-asn"
              onClick={onOpenManageAsn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400 transition shadow-md"
              title="Kelola & Tambah Pegawai ASN (Otoritas Kepala BPSDM)"
            >
              <UserCog className="w-3.5 h-3.5" />
              <span>Kelola Pegawai</span>
            </button>
          )}
          {/* ROLE SWITCHER: Pegawai ASN vs Kepala BPSDM */}
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center gap-1">
            <button
              id="role-btn-pegawai"
              onClick={() => onSelectUserMode('PEGAWAI')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                userMode === 'PEGAWAI'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Pegawai ASN</span>
            </button>

            <button
              id="role-btn-pimpinan"
              onClick={() => onSelectUserMode('PIMPINAN_KEPALA_BPSDM')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                userMode === 'PIMPINAN_KEPALA_BPSDM'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-200" />
              <span>Kepala BPSDM</span>
            </button>
          </div>

          {/* Metaverse Pemantauan Kepala BPSDM Quick Button */}
          {onOpenMetaverse && (
            <button
              id="btn-open-metaverse-header"
              onClick={onOpenMetaverse}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-linear-to-r from-amber-600 via-amber-500 to-cyan-600 hover:from-amber-500 hover:to-cyan-500 text-white shadow-md border border-amber-400/40 transition group"
              title="Masuk ke Ruang Metaverse 3D Pemantauan Kepala BPSDM"
            >
              <Crown className="w-3.5 h-3.5 text-yellow-200 group-hover:rotate-12 transition-transform" />
              <span>Metaverse 3D Pimpinan</span>
              <span className="bg-amber-950/80 text-amber-300 text-[9px] px-1 py-0.2 rounded font-mono border border-amber-400/40">
                VR
              </span>
            </button>
          )}

          {/* Apps Script & Code.gs Modal Button */}
          <button
            id="btn-open-appsscript-modal"
            onClick={onOpenAppsScriptModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Lihat Kode Backend Google Apps Script (Code.gs)"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Code.gs & Server</span>
          </button>

          {/* AI Advisor Button */}
          <button
            id="btn-open-ai-advisor"
            onClick={onOpenAiAdvisor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-xs border border-emerald-400/30 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Asisten Si-Praja AI</span>
          </button>

          {/* Google Workspace Integration Hub Button */}
          <button
            id="btn-open-workspace-modal"
            onClick={onOpenWorkspaceModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <FolderSync className="w-3.5 h-3.5 text-blue-400" />
            <span>Command Center Google</span>
          </button>

          {/* Google SSO Login Button */}
          <button
            id="btn-google-sso-header"
            onClick={onOpenSsoModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs border ${
              workspaceState.isSignedIn
                ? 'bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border-emerald-600/70'
                : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300'
            }`}
            title={
              workspaceState.isSignedIn
                ? `Terhubung sebagai ${workspaceState.userName} (${workspaceState.userEmail})`
                : 'Masuk dengan Akun Google SSO ASN BPSDM'
            }
          >
            {workspaceState.isSignedIn ? (
              <>
                {workspaceState.userPhoto ? (
                  <img
                    src={workspaceState.userPhoto}
                    alt={workspaceState.userName || 'User'}
                    className="w-4 h-4 rounded-full border border-emerald-400 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-ping" />
                )}
                <span className="truncate max-w-[110px] sm:max-w-[140px]">
                  {workspaceState.userName?.split(' ')[0] || 'SSO Aktif'}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded border border-emerald-500/30">
                  SSO
                </span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
                <span>Login SSO Google</span>
              </>
            )}
          </button>

          {/* ASN Profile Switcher Dropdown */}
          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-left">
              <label htmlFor="asn-role-selector" className="sr-only">Pilih Profil ASN</label>
              <select
                id="asn-role-selector"
                value={currentAsn.id}
                onChange={(e) => {
                  const selected = allAsn.find((a) => a.id === e.target.value);
                  if (selected) onSelectAsn(selected);
                }}
                className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[170px] truncate"
              >
                {allAsn.map((asn) => (
                  <option key={asn.id} value={asn.id} className="bg-slate-900 text-white">
                    {asn.nama} ({asn.role})
                  </option>
                ))}
              </select>
              <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
                {currentAsn.jabatan}
              </div>
            </div>
          </div>

          {/* Return to SSO Landing Page / Switch Account Button */}
          {onSwitchAccountToLandingPage && (
            <button
              id="btn-return-sso-landing"
              onClick={onSwitchAccountToLandingPage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-700/60 text-slate-300 border border-slate-700 transition"
              title="Ganti Akun / Kembali ke Halaman Awal SSO Google"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ganti Akun / Halaman SSO</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

