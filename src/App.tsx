import React, { useState, useEffect } from 'react';
import { 
  ASNProfile, 
  FwaRequest, 
  SkpOutputItem, 
  DiklatAgenda, 
  EppSurveyRecord, 
  QuotaCalculation, 
  UnitKerjaId, 
  GoogleWorkspaceState, 
  KategoriKediklatan,
  UserMode,
  PresensiRecord,
  DailyTask
} from './types';
import { UNIT_KERJA_LIST, INITIAL_ASN_PROFILES, INITIAL_DAILY_TASKS, INITIAL_PRESENSI } from './data/mockData';
import { apiService, StatsResponse, calculateLocalStats } from './services/api';
import { initAuth, googleSignIn, logout } from './services/workspace';
import { Header } from './components/Header';
import { QuotaOverviewCard } from './components/QuotaOverviewCard';
import { FwaApplicationModal } from './components/FwaApplicationModal';
import { SkpOutputSection } from './components/SkpOutputSection';
import { TrainingCoordinationSection } from './components/TrainingCoordinationSection';
import { WorkspaceSyncModal } from './components/WorkspaceSyncModal';
import { AiAdvisorDrawer } from './components/AiAdvisorDrawer';
import { FwaRequestsSection } from './components/FwaRequestsSection';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { WorkHoursWidget } from './components/WorkHoursWidget';
import { TaskBoardSection } from './components/TaskBoardSection';
import { AppsScriptCodeModal } from './components/AppsScriptCodeModal';
import { CommandCenterDashboard } from './components/CommandCenterDashboard';
import { GoogleSsoModal } from './components/GoogleSsoModal';
import { SsoLandingPage } from './components/SsoLandingPage';
import { AsnManagementSection } from './components/AsnManagementSection';
import { BpsdmCampusGalleryModal } from './components/BpsdmCampusGalleryModal';
import { 
  LayoutDashboard, 
  FileCheck, 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  ListTodo,
  Radio,
  UserCog,
  Camera
} from 'lucide-react';

export default function App() {
  const [currentAsn, setCurrentAsn] = useState<ASNProfile>(INITIAL_ASN_PROFILES[0]);
  const [allAsn, setAllAsn] = useState<ASNProfile[]>(() => {
    try {
      const saved = localStorage.getItem('bpsdm_all_asn');
      return saved ? JSON.parse(saved) : INITIAL_ASN_PROFILES;
    } catch {
      return INITIAL_ASN_PROFILES;
    }
  });
  const [stats, setStats] = useState<StatsResponse>(() => calculateLocalStats());
  const [fwaRequests, setFwaRequests] = useState<FwaRequest[]>([]);
  const [skpOutputs, setSkpOutputs] = useState<SkpOutputItem[]>([]);
  const [agendas, setAgendas] = useState<DiklatAgenda[]>([]);
  const [eppSurveys, setEppSurveys] = useState<EppSurveyRecord[]>([]);

  // Initial Google SSO Landing Page state
  const [hasEnteredApp, setHasEnteredApp] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('bpsdm_has_entered') === 'true';
    } catch {
      return false;
    }
  });

  // User Mode: Pegawai ASN vs Kepala BPSDM
  const [userMode, setUserMode] = useState<UserMode>('PEGAWAI');

  // Daily Tasks & Presensi Records
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(() => {
    try {
      const saved = localStorage.getItem('bpsdm_daily_tasks');
      return saved ? JSON.parse(saved) : INITIAL_DAILY_TASKS;
    } catch {
      return INITIAL_DAILY_TASKS;
    }
  });

  const [presensiList, setPresensiList] = useState<PresensiRecord[]>(() => {
    try {
      const saved = localStorage.getItem('bpsdm_presensi_records');
      return saved ? JSON.parse(saved) : INITIAL_PRESENSI;
    } catch {
      return INITIAL_PRESENSI;
    }
  });

  // Navigation tab (Default to CommandCenter for high-tech operational overview)
  const [activeTab, setActiveTab] = useState<'COMMAND_CENTER' | 'DASHBOARD' | 'TASKS' | 'SKP' | 'FWA' | 'DIKLAT' | 'MANAGE_ASN'>('COMMAND_CENTER');

  // Modals & Drawers
  const [isFwaModalOpen, setIsFwaModalOpen] = useState<boolean>(false);
  const [fwaDefaultUnit, setFwaDefaultUnit] = useState<UnitKerjaId | undefined>();
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState<boolean>(false);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState<boolean>(false);
  const [isAppsScriptModalOpen, setIsAppsScriptModalOpen] = useState<boolean>(false);
  const [isSsoModalOpen, setIsSsoModalOpen] = useState<boolean>(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState<boolean>(false);

  // Toast banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Google Workspace State
  const [workspaceState, setWorkspaceState] = useState<GoogleWorkspaceState>({
    isSignedIn: false,
    userEmail: null,
    userName: null,
    userPhoto: null,
    accessToken: null,
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Sync dailyTasks & presensiList & allAsn to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bpsdm_daily_tasks', JSON.stringify(dailyTasks));
    } catch {}
  }, [dailyTasks]);

  useEffect(() => {
    try {
      localStorage.setItem('bpsdm_presensi_records', JSON.stringify(presensiList));
    } catch {}
  }, [presensiList]);

  useEffect(() => {
    try {
      localStorage.setItem('bpsdm_all_asn', JSON.stringify(allAsn));
    } catch {}
  }, [allAsn]);

  // 1. Initialize Google Workspace Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setWorkspaceState({
          isSignedIn: true,
          userEmail: user.email,
          userName: user.displayName,
          userPhoto: user.photoURL,
          accessToken: token,
        });
      },
      () => {
        setWorkspaceState({
          isSignedIn: false,
          userEmail: null,
          userName: null,
          userPhoto: null,
          accessToken: null,
        });
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // 2. Fetch Initial Data
  const loadAllData = async () => {
    try {
      const [statsRes, asnRes, fwaRes, skpRes, agendaRes, eppRes] = await Promise.all([
        apiService.getStats(),
        apiService.getAsnProfiles(),
        apiService.getFwaRequests(),
        apiService.getSkpOutputs(),
        apiService.getAgendas(),
        apiService.getEppSurveys(),
      ]);

      setStats(statsRes);
      setAllAsn(asnRes);
      setFwaRequests(fwaRes);
      setSkpOutputs(skpRes);
      setAgendas(agendaRes);
      setEppSurveys(eppRes);
    } catch (e) {
      console.error('Error loading initial data:', e);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Google Auth Handlers
  const handleGoogleSignIn = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setWorkspaceState({
          isSignedIn: true,
          userEmail: res.user.email,
          userName: res.user.displayName,
          userPhoto: res.user.photoURL,
          accessToken: res.accessToken,
        });
        showToast(`Google Workspace terhubung: ${res.user.displayName || res.user.email}`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal login Google Workspace', 'error');
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logout();
      setWorkspaceState({
        isSignedIn: false,
        userEmail: null,
        userName: null,
        userPhoto: null,
        accessToken: null,
      });
      showToast('Koneksi Google Workspace diputuskan', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal logout Google', 'error');
    }
  };

  // Submit FWA with strict 50% quota enforcement
  const handleSubmitFwa = async (payload: {
    asnId: string;
    tanggal: string;
    jenisKerja: 'WFH' | 'WFO';
    alasanRencanaKerja: string;
    rencanaLuaranKinerja: string[];
  }) => {
    const res = await apiService.submitFwaRequest(payload);
    if (res.success) {
      showToast(res.message, 'success');
      await loadAllData();
    }
    return res;
  };

  // Verify FWA by Supervisor
  const handleVerifyFwa = async (id: string, status: 'DISETUJUI' | 'DITOLAK', catatan?: string) => {
    await apiService.verifyFwaRequest(id, status, catatan);
    showToast(`Permohonan FWA telah ${status.toLowerCase()}`, 'success');
    await loadAllData();
  };

  // Submit SKP Output
  const handleSubmitSkpOutput = async (payload: {
    asnId: string;
    kategoriKediklatan: KategoriKediklatan;
    uraianTugas: string;
    targetKuantitas: number;
    satuanOutput: string;
    realisasiKuantitas: number;
    tautanEvidenDrive: string;
    namaFileEviden: string;
  }) => {
    await apiService.submitSkpOutput(payload);
    showToast('Luaran kinerja harian berhasil disimpan!', 'success');
    const updated = await apiService.getSkpOutputs();
    setSkpOutputs(updated);
  };

  // Rate SKP Output
  const handleRateSkpOutput = async (
    id: string,
    rating: 'DI_ATAS_EKSPEKTASI' | 'SESUAI_EKSPEKTASI' | 'DI_BAWAH_EKSPEKTASI',
    feedback: string
  ) => {
    await apiService.rateSkpOutput(id, rating, feedback);
    showToast('Penilaian kinerja berhasil disimpan', 'success');
    const updated = await apiService.getSkpOutputs();
    setSkpOutputs(updated);
  };

  // Create Agenda
  const handleCreateAgenda = async (agenda: Omit<DiklatAgenda, 'id' | 'status'>) => {
    await apiService.createAgenda(agenda);
    showToast('Agenda pelatihan baru berhasil dijadwalkan', 'success');
    const updated = await apiService.getAgendas();
    setAgendas(updated);
  };

  // Quick action from Quota Card
  const handleOpenFwaModal = (unitId?: UnitKerjaId) => {
    setFwaDefaultUnit(unitId);
    setIsFwaModalOpen(true);
  };

  // Presensi Handler
  const handlePresensiSubmit = async (record: Omit<PresensiRecord, 'id' | 'createdAt'>) => {
    const newRecord: PresensiRecord = {
      ...record,
      id: `prs-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPresensiList((prev) => [newRecord, ...prev]);
    showToast(`Presensi ${record.tipe} berhasil dicatat & divalidasi geolokasi!`, 'success');

    // Coba simpan ke server Python / API lokal jika aktif
    try {
      await fetch('/api/presensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });
    } catch {
      // Offline fallback ok
    }
  };

  // Daily Tasks Handlers
  const handleAddTask = async (taskData: Omit<DailyTask, 'id' | 'createdAt'>) => {
    const newTask: DailyTask = {
      ...taskData,
      id: `tsk-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDailyTasks((prev) => [newTask, ...prev]);
    showToast('Target luaran kinerja harian berhasil ditambahkan!', 'success');

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
    } catch {
      // Offline fallback ok
    }
  };

  const handleUpdateTaskProgress = async (taskId: string, progres: 0 | 50 | 100) => {
    setDailyTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const status = progres === 100 ? 'SELESAI' : progres === 50 ? 'PROSES' : 'BELUM_MULAI';
          return { ...t, progres, status };
        }
        return t;
      })
    );
    showToast(`Progres diperbarui menjadi ${progres}%`, 'success');
  };

  const handleUpdateTaskEvidence = async (taskId: string, evidenceUrl: string, evidenceFileName: string) => {
    setDailyTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, evidenceUrl, evidenceFileName } : t))
    );
    showToast('Tautan bukti fisik Google Drive berhasil diperbarui!', 'success');
  };

  const handleApproveExecutiveRequest = async (requestId: string, status: 'DISETUJUI' | 'DITOLAK') => {
    await handleVerifyFwa(requestId, status, 'Disetujui oleh Kepala BPSDM (Dispensasi Khusus Kepemimpinan)');
  };

  const handleBroadcastChat = async (title: string, message: string) => {
    try {
      await apiService.sendChatWebhook(
        title,
        message,
        'ARAHAN_KEPALA_BPSDM',
        currentAsn.nama
      );
      showToast('Siaran Komando Pimpinan berhasil dikirim ke Google Chat Space BPSDM!', 'success');
    } catch {
      showToast('Gagal menyiarkan ke Google Chat.', 'error');
    }
  };

  // ASN Management Handlers (Authorized for Kepala BPSDM)
  const handleAddAsn = async (newProfile: ASNProfile) => {
    setAllAsn((prev) => [newProfile, ...prev]);
    showToast(`Pegawai ASN ${newProfile.nama} berhasil didaftarkan ke BPSDM ONE!`, 'success');
  };

  const handleUpdateAsn = async (updatedProfile: ASNProfile) => {
    setAllAsn((prev) =>
      prev.map((item) => (item.id === updatedProfile.id ? updatedProfile : item))
    );
    if (currentAsn.id === updatedProfile.id) {
      setCurrentAsn(updatedProfile);
    }
    showToast(`Identitas pegawai ${updatedProfile.nama} berhasil diperbarui!`, 'success');
  };

  const handleDeleteAsn = async (asnId: string) => {
    const target = allAsn.find((a) => a.id === asnId);
    if (target?.role === 'KEPALA_BPSDM') {
      showToast('Profil Kepala BPSDM tidak dapat dihapus.', 'error');
      return;
    }
    setAllAsn((prev) => prev.filter((a) => a.id !== asnId));
    showToast(`Pegawai ${target?.nama || asnId} berhasil dinonaktifkan/dihapus dari roster.`, 'success');
  };

  const handleResetAsnToDefault = () => {
    setAllAsn(INITIAL_ASN_PROFILES);
    try {
      localStorage.setItem('bpsdm_all_asn', JSON.stringify(INITIAL_ASN_PROFILES));
    } catch {}
    showToast('Data roster pegawai berhasil dikembalikan ke standar awal.', 'success');
  };

  // If user has not entered or opted to view Google SSO landing page
  if (!hasEnteredApp) {
    return (
      <SsoLandingPage
        availableProfiles={allAsn}
        onLoginSuccess={(profile) => {
          setCurrentAsn(profile);
          setUserMode(profile.role === 'KEPALA_BPSDM' ? 'PIMPINAN_KEPALA_BPSDM' : 'PEGAWAI');
          setWorkspaceState((prev) => ({
            ...prev,
            isSignedIn: true,
            userEmail: profile.email,
            userName: profile.nama,
          }));
          setHasEnteredApp(true);
          try {
            sessionStorage.setItem('bpsdm_has_entered', 'true');
          } catch {}
          showToast(`Berhasil login SSO Google: ${profile.nama}`, 'success');
        }}
        onContinueAsGuest={() => {
          setHasEnteredApp(true);
          try {
            sessionStorage.setItem('bpsdm_has_entered', 'true');
          } catch {}
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-800 text-white border border-emerald-700'
                : 'bg-rose-800 text-white border border-rose-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-300" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Official Government Portal Header with Role Switcher */}
      <Header
        currentAsn={currentAsn}
        allAsn={allAsn}
        onSelectAsn={(asn) => {
          setCurrentAsn(asn);
          showToast(`Beralih ke profil: ${asn.nama} (${asn.role})`, 'success');
        }}
        workspaceState={workspaceState}
        userMode={userMode}
        onSelectUserMode={(mode) => {
          setUserMode(mode);
          showToast(
            mode === 'PIMPINAN_KEPALA_BPSDM'
              ? 'Beralih ke Mode Pengawasan: Kepala BPSDM Provinsi Jawa Timur'
              : 'Beralih ke Mode Pegawai ASN BPSDM Jatim',
            'success'
          );
        }}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
        onOpenSsoModal={() => setIsSsoModalOpen(true)}
        onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
        onOpenAppsScriptModal={() => setIsAppsScriptModalOpen(true)}
        onSwitchAccountToLandingPage={() => {
          setHasEnteredApp(false);
          try {
            sessionStorage.removeItem('bpsdm_has_entered');
          } catch {}
        }}
        onOpenGallery={() => setIsGalleryModalOpen(true)}
        onOpenManageAsn={() => setActiveTab('MANAGE_ASN')}
      />

      {/* Sub-Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center space-x-1 py-2 text-xs font-semibold">
            <button
              id="nav-command-center"
              onClick={() => setActiveTab('COMMAND_CENTER')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 shrink-0 ${
                activeTab === 'COMMAND_CENTER'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Pusat Komando (Command Center)</span>
              <span className="bg-emerald-500/20 text-emerald-600 text-[10px] px-1.5 py-0.2 rounded font-mono border border-emerald-500/30">
                LIVE
              </span>
            </button>

            <button
              id="nav-dashboard"
              onClick={() => setActiveTab('DASHBOARD')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 shrink-0 ${
                activeTab === 'DASHBOARD'
                  ? 'bg-emerald-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{userMode === 'PIMPINAN_KEPALA_BPSDM' ? 'Dasbor Pimpinan' : 'Presensi & Kuota WFH'}</span>
            </button>

            <button
              id="nav-tasks"
              onClick={() => setActiveTab('TASKS')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 shrink-0 ${
                activeTab === 'TASKS'
                  ? 'bg-emerald-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              <span>Papan Rencana Kinerja ({dailyTasks.length})</span>
            </button>

            <button
              id="nav-fwa"
              onClick={() => setActiveTab('FWA')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 shrink-0 ${
                activeTab === 'FWA'
                  ? 'bg-emerald-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Permohonan FWA ({fwaRequests.length})</span>
            </button>

            <button
              id="nav-skp"
              onClick={() => setActiveTab('SKP')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 shrink-0 ${
                activeTab === 'SKP'
                  ? 'bg-emerald-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Luaran Kinerja SKP ({skpOutputs.length})</span>
            </button>

            <button
              id="nav-diklat"
              onClick={() => setActiveTab('DIKLAT')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 shrink-0 ${
                activeTab === 'DIKLAT'
                  ? 'bg-emerald-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Pusat Kediklatan & Si-Praja</span>
            </button>

            {/* TAB KELOLA PEGAWAI (KHUSUS KEPALA BPSDM) */}
            {(userMode === 'PIMPINAN_KEPALA_BPSDM' || currentAsn.role === 'KEPALA_BPSDM') && (
              <button
                id="nav-manage-asn"
                onClick={() => setActiveTab('MANAGE_ASN')}
                className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 shrink-0 border ${
                  activeTab === 'MANAGE_ASN'
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-xs'
                    : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                }`}
              >
                <UserCog className="w-4 h-4 text-amber-700" />
                <span>Kelola Pegawai ASN ({allAsn.length})</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                  PIMPINAN
                </span>
              </button>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Mode Aktif: <strong className="text-slate-800">{userMode === 'PIMPINAN_KEPALA_BPSDM' ? 'Pimpinan BPSDM' : 'Pegawai ASN'}</strong></span>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* TAB 0: COMMAND CENTER TERPADU (DEFAULT HERO VIEW) */}
        {activeTab === 'COMMAND_CENTER' && stats && (
          <CommandCenterDashboard
            currentAsn={currentAsn}
            allAsn={allAsn}
            quotas={stats.quotas}
            fwaRequests={fwaRequests}
            userMode={userMode}
            workspaceState={workspaceState}
            presensiList={presensiList}
            dailyTasks={dailyTasks}
            onSelectUserMode={setUserMode}
            onOpenFwaModal={() => handleOpenFwaModal()}
            onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
            onOpenSsoModal={() => setIsSsoModalOpen(true)}
            onApproveRequest={handleApproveExecutiveRequest}
            onBroadcastChat={handleBroadcastChat}
            onOpenManageAsn={() => setActiveTab('MANAGE_ASN')}
            onOpenGallery={() => setIsGalleryModalOpen(true)}
          />
        )}
        {/* EXECUTIVE DASHBOARD VIEW (When Kepala BPSDM Mode is active) */}
        {userMode === 'PIMPINAN_KEPALA_BPSDM' && stats && (
          <ExecutiveDashboard
            quotas={stats.quotas}
            fwaRequests={fwaRequests}
            asnProfiles={allAsn}
            onApproveRequest={handleApproveExecutiveRequest}
            onOpenManageAsn={() => setActiveTab('MANAGE_ASN')}
          />
        )}

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'DASHBOARD' && stats && (
          <div className="space-y-6">
            {/* Real-Time Work Hours & Geolocation Widget (Only in Pegawai Mode) */}
            {userMode === 'PEGAWAI' && (
              <WorkHoursWidget
                currentAsn={currentAsn}
                currentQuota={stats.quotas.find((q) => q.unitKerjaId === currentAsn.unitKerjaId)}
                presensiList={presensiList}
                onPresensiSubmit={handlePresensiSubmit}
              />
            )}

            {/* Primary Quota Monitoring Card */}
            <QuotaOverviewCard
              quotas={stats.quotas}
              overallWfhPercentage={stats.overallWfhPercentage}
              totalAsn={stats.totalAsn}
              totalWfh={stats.totalWfh}
              totalWfo={stats.totalWfo}
              selectedDate={stats.tanggal}
              onApplyFwa={handleOpenFwaModal}
            />

            {/* Papan Rencana Kinerja Harian (Task Board Section) */}
            {userMode === 'PEGAWAI' && (
              <TaskBoardSection
                tasks={dailyTasks}
                currentAsn={currentAsn}
                onAddTask={handleAddTask}
                onUpdateProgress={handleUpdateTaskProgress}
                onUpdateEvidence={handleUpdateTaskEvidence}
              />
            )}

            {/* Quick FWA Requests Summary */}
            <FwaRequestsSection
              requests={fwaRequests}
              currentAsn={currentAsn}
              onVerifyRequest={handleVerifyFwa}
              onOpenNewApplication={() => handleOpenFwaModal()}
            />

            {/* Quick SKP Highlights */}
            <SkpOutputSection
              outputs={skpOutputs}
              currentAsn={currentAsn}
              onSubmitOutput={handleSubmitSkpOutput}
              onRateOutput={handleRateSkpOutput}
              onOpenGoogleDriveSync={() => setIsWorkspaceModalOpen(true)}
            />
          </div>
        )}

        {/* TAB 2: TASKS / PAPAN RENCANA KINERJA */}
        {activeTab === 'TASKS' && (
          <TaskBoardSection
            tasks={dailyTasks}
            currentAsn={currentAsn}
            onAddTask={handleAddTask}
            onUpdateProgress={handleUpdateTaskProgress}
            onUpdateEvidence={handleUpdateTaskEvidence}
          />
        )}

        {/* TAB 3: FWA REQUESTS & VALIDATION */}
        {activeTab === 'FWA' && (
          <div className="space-y-6">
            {stats && (
              <QuotaOverviewCard
                quotas={stats.quotas}
                overallWfhPercentage={stats.overallWfhPercentage}
                totalAsn={stats.totalAsn}
                totalWfh={stats.totalWfh}
                totalWfo={stats.totalWfo}
                selectedDate={stats.tanggal}
                onApplyFwa={handleOpenFwaModal}
              />
            )}
            <FwaRequestsSection
              requests={fwaRequests}
              currentAsn={currentAsn}
              onVerifyRequest={handleVerifyFwa}
              onOpenNewApplication={() => handleOpenFwaModal()}
            />
          </div>
        )}

        {/* TAB 4: SKP OUTPUT LOGGER (PermenPANRB 6/2022) */}
        {activeTab === 'SKP' && (
          <SkpOutputSection
            outputs={skpOutputs}
            currentAsn={currentAsn}
            onSubmitOutput={handleSubmitSkpOutput}
            onRateOutput={handleRateSkpOutput}
            onOpenGoogleDriveSync={() => setIsWorkspaceModalOpen(true)}
          />
        )}

        {/* TAB 5: KEDIKLATAN & LMS SI-PRAJA */}
        {activeTab === 'DIKLAT' && (
          <TrainingCoordinationSection
            agendas={agendas}
            eppSurveys={eppSurveys}
            unitList={UNIT_KERJA_LIST}
            onScheduleMeet={() => setIsWorkspaceModalOpen(true)}
            onCreateNewAgenda={handleCreateAgenda}
            onOpenSheetsExport={() => setIsWorkspaceModalOpen(true)}
          />
        )}

        {/* TAB 6: KELOLA ROSTER PEGAWAI ASN (KEPALA BPSDM) */}
        {activeTab === 'MANAGE_ASN' && (
          <AsnManagementSection
            allAsn={allAsn}
            currentAsn={currentAsn}
            onAddAsn={handleAddAsn}
            onUpdateAsn={handleUpdateAsn}
            onDeleteAsn={handleDeleteAsn}
            onResetToDefault={handleResetAsnToDefault}
          />
        )}
      </main>

      {/* MODALS */}
      {/* Galeri Kampus BPSDM Jatim Modal */}
      <BpsdmCampusGalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
      />
      {stats && (
        <FwaApplicationModal
          isOpen={isFwaModalOpen}
          onClose={() => setIsFwaModalOpen(false)}
          currentAsn={currentAsn}
          unitList={UNIT_KERJA_LIST}
          quotas={stats.quotas}
          defaultUnitId={fwaDefaultUnit}
          onSubmit={handleSubmitFwa}
        />
      )}

      {stats && (
        <WorkspaceSyncModal
          isOpen={isWorkspaceModalOpen}
          onClose={() => setIsWorkspaceModalOpen(false)}
          workspaceState={workspaceState}
          onGoogleSignIn={handleGoogleSignIn}
          fwaRequests={fwaRequests}
          skpOutputs={skpOutputs}
          agendas={agendas}
          quotas={stats.quotas}
          onSendChatNotification={async (title, msg, type) => {
            const res = await apiService.sendChatWebhook(title, msg, type, currentAsn.nama);
            showToast('Notifikasi Google Chat berhasil disiarkan', 'success');
            return res;
          }}
        />
      )}

      {stats && (
        <AiAdvisorDrawer
          isOpen={isAiAdvisorOpen}
          onClose={() => setIsAiAdvisorOpen(false)}
          currentAsn={currentAsn}
          quotas={stats.quotas}
        />
      )}

      {/* Backend Code.gs & Server Panduan Modal */}
      <AppsScriptCodeModal
        isOpen={isAppsScriptModalOpen}
        onClose={() => setIsAppsScriptModalOpen(false)}
      />

      {/* Google SSO Login & Account Switcher Modal */}
      <GoogleSsoModal
        isOpen={isSsoModalOpen}
        onClose={() => setIsSsoModalOpen(false)}
        workspaceState={workspaceState}
        currentAsn={currentAsn}
        allAsn={allAsn}
        onSelectAsn={(asn) => {
          setCurrentAsn(asn);
          showToast(`SSO terhubung dengan profil: ${asn.nama}`, 'success');
        }}
        onAuthChange={(newState) => {
          setWorkspaceState(newState);
          showToast(
            newState.isSignedIn
              ? `Berhasil login SSO: ${newState.userName}`
              : 'Berhasil logout dari akun SSO Google',
            'success'
          );
        }}
      />

      {/* Institutional SPBE Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">
              Badan Pengembangan Sumber Daya Manusia (BPSDM) Provinsi Jawa Timur
            </span>
          </div>
          <div className="text-[11px] text-slate-400 text-center md:text-right space-y-0.5">
            <div>Jl. Balongsari Tama No. 1, Tandes, Surabaya, Jawa Timur 60186</div>
            <div className="text-emerald-400/80 font-mono">
              Standar SPBE • Perpres No. 21/2023 • PermenPANRB No. 6/2022
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
