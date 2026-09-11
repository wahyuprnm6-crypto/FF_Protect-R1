import React, { useState } from 'react';
import { GoogleWorkspaceState, ASNProfile } from '../types';
import { googleSignIn, simulateSsoSignIn, logout } from '../services/workspace';
import { 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  LogOut, 
  Building2, 
  Mail, 
  UserCheck, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';

interface GoogleSsoModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceState: GoogleWorkspaceState;
  currentAsn: ASNProfile;
  allAsn: ASNProfile[];
  onSelectAsn: (asn: ASNProfile) => void;
  onAuthChange: (state: GoogleWorkspaceState) => void;
}

export const GoogleSsoModal: React.FC<GoogleSsoModalProps> = ({
  isOpen,
  onClose,
  workspaceState,
  currentAsn,
  allAsn,
  onSelectAsn,
  onAuthChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNativeGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res && res.user) {
        const newState: GoogleWorkspaceState = {
          isSignedIn: true,
          userEmail: res.user.email,
          userName: res.user.displayName,
          userPhoto: res.user.photoURL,
          accessToken: res.accessToken,
        };
        onAuthChange(newState);
        setSuccessMessage(`Berhasil masuk sebagai ${res.user.displayName} (${res.user.email})`);

        // Cocokkan otomatis dengan ASN profile jika email cocok
        const matchedAsn = allAsn.find(
          (a) => a.email.toLowerCase() === (res.user.email || '').toLowerCase()
        );
        if (matchedAsn) {
          onSelectAsn(matchedAsn);
        }
      }
    } catch (err: any) {
      console.warn('Native Google Auth error:', err);
      // Popup blocked or auth failure
      setErrorMessage(
        'Popup Google diblokir oleh peramban atau pratinjau iFrame. Silakan gunakan tombol "Masuk Cepat SSO ASN" di bawah untuk verifikasi instan.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSsoLogin = (asn: ASNProfile) => {
    setIsLoading(true);
    try {
      const res = simulateSsoSignIn(asn.email, asn.nama);
      const newState: GoogleWorkspaceState = {
        isSignedIn: true,
        userEmail: res.user.email,
        userName: res.user.displayName,
        userPhoto: res.user.photoURL,
        accessToken: res.accessToken,
      };
      onAuthChange(newState);
      onSelectAsn(asn);
      setSuccessMessage(`SSO Terverifikasi! Terhubung sebagai ${asn.nama} (${asn.nip})`);
    } catch (err: any) {
      setErrorMessage('Gagal melakukan otentikasi SSO.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logout();
      onAuthChange({
        isSignedIn: false,
        userEmail: null,
        userName: null,
        userPhoto: null,
        accessToken: null,
      });
      setSuccessMessage('Berhasil keluar dari akun Google SSO.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-900 via-slate-900 to-teal-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-2 flex items-center justify-center shadow-md">
              <svg className="w-full h-full" viewBox="0 0 24 24">
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
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                SSO Google Workspace ASN
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Resmi Pemprov Jatim
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Single Sign-On Terintegrasi Google Cloud & SPBE BPSDM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Status Banner */}
          {workspaceState.isSignedIn ? (
            <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-xl p-4 flex items-start gap-3.5">
              {workspaceState.userPhoto ? (
                <img
                  src={workspaceState.userPhoto}
                  alt={workspaceState.userName || 'User'}
                  className="w-12 h-12 rounded-full border-2 border-emerald-400 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {(workspaceState.userName || 'A').substring(0, 1)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                    SSO Aktif & Terverifikasi
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-sm font-bold text-white truncate">
                  {workspaceState.userName}
                </div>
                <div className="text-xs text-slate-300 font-mono truncate">
                  {workspaceState.userEmail}
                </div>
                <div className="mt-2 text-[11px] text-emerald-400/90 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Akses Google Drive, Calendar, dan Meet aktif</span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 transition flex items-center gap-1 shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 text-center space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Gunakan akun Google resmi kedinasan Anda (@jatimprov.go.id atau akun Google terdaftar) untuk sinkronisasi otomatis presensi, jadwal Google Calendar, dan bukti kinerja Google Drive.
              </p>
              <button
                id="btn-google-popup-login"
                onClick={handleNativeGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 shadow-md transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>{isLoading ? 'Menghubungkan...' : 'Masuk dengan Akun Google (Popup)'}</span>
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="bg-amber-950/70 border border-amber-800 text-amber-200 text-xs p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Quick SSO Roster Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Pilih Akun ASN Terdaftar untuk Masuk Instan (SSO):</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                {allAsn.length} Akun Terdaftar
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800/50">
              {allAsn.map((asn) => {
                const isCurrent = currentAsn.id === asn.id;
                const isEmailMatched =
                  workspaceState.userEmail?.toLowerCase() === asn.email.toLowerCase();

                return (
                  <button
                    key={asn.id}
                    onClick={() => handleQuickSsoLogin(asn)}
                    className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between group ${
                      isCurrent
                        ? 'bg-emerald-900/40 border border-emerald-600/60'
                        : 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-700 group-hover:bg-emerald-700 flex items-center justify-center font-bold text-xs text-white shrink-0">
                        {asn.nama.substring(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1.5">
                          <span>{asn.nama}</span>
                          {asn.role === 'KEPALA_BPSDM' && (
                            <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded border border-amber-500/30">
                              Kepala BPSDM
                            </span>
                          )}
                          {isEmailMatched && (
                            <span className="bg-blue-500/20 text-blue-300 text-[10px] px-1.5 py-0.2 rounded border border-blue-500/30">
                              Email SSO
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate flex items-center gap-2">
                          <span className="font-mono">{asn.nip}</span>
                          <span>•</span>
                          <span className="text-emerald-400/90">{asn.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      <span className="text-[11px] font-semibold text-emerald-400 group-hover:text-emerald-300 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-800/60">
                        {isCurrent ? 'Aktif' : 'Login'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pemerintah Provinsi Jawa Timur</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
