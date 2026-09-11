import { 
  ASNProfile, 
  FwaRequest, 
  SkpOutputItem, 
  DiklatAgenda, 
  EppSurveyRecord, 
  QuotaCalculation, 
  UnitKerjaId 
} from '../types';
import { 
  INITIAL_ASN_PROFILES, 
  INITIAL_FWA_REQUESTS, 
  INITIAL_SKP_OUTPUTS, 
  INITIAL_DIKLAT_AGENDAS, 
  INITIAL_EPP_SURVEYS, 
  UNIT_KERJA_LIST 
} from '../data/mockData';

const STORAGE_KEYS = {
  ASN: 'bpsdm_asn_profiles',
  FWA: 'bpsdm_fwa_requests',
  SKP: 'bpsdm_skp_outputs',
  AGENDAS: 'bpsdm_diklat_agendas',
  EPP: 'bpsdm_epp_surveys',
};

// Fallback Local Storage helpers
function getLocal<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return initial;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export interface StatsResponse {
  tanggal: string;
  totalAsn: number;
  totalWfh: number;
  totalWfo: number;
  overallWfhPercentage: number;
  kuotaMaxGlobal50Persen: number;
  isGlobalQuotaCompliant: boolean;
  quotas: QuotaCalculation[];
}

export function calculateLocalStats(tanggal?: string): StatsResponse {
  const fwaList = getLocal<FwaRequest[]>(STORAGE_KEYS.FWA, INITIAL_FWA_REQUESTS);
  const queryDate = tanggal || new Date().toISOString().split('T')[0];
  const totalAsn = UNIT_KERJA_LIST.reduce((acc, u) => acc + u.totalAsn, 0);

  const quotas: QuotaCalculation[] = UNIT_KERJA_LIST.map((unit) => {
    const approvedWfh = fwaList.filter(
      (r) => r.unitKerjaId === unit.id && r.tanggal === queryDate && r.jenisKerja === 'WFH' && r.status === 'DISETUJUI'
    ).length;
    const persentaseWfh = Math.round((approvedWfh / unit.totalAsn) * 100);
    const kuotaTersediaWfh = Math.max(0, unit.kuotaMaksimalWfh - approvedWfh);

    return {
      unitKerjaId: unit.id,
      unitKerjaNama: unit.nama,
      totalAsn: unit.totalAsn,
      maksimalWfh: unit.kuotaMaksimalWfh,
      jumlahWfhHariIni: approvedWfh,
      jumlahWfoHariIni: unit.totalAsn - approvedWfh,
      persentaseWfh,
      kuotaTersediaWfh,
      isQuotaExceeded: approvedWfh > unit.kuotaMaksimalWfh,
      statusLayananFisik: approvedWfh >= unit.kuotaMaksimalWfh ? 'KRITIS' : approvedWfh >= unit.kuotaMaksimalWfh * 0.8 ? 'WASPADA' : 'OPTIMAL',
    };
  });

  const totalWfh = quotas.reduce((acc, q) => acc + q.jumlahWfhHariIni, 0);

  return {
    tanggal: queryDate,
    totalAsn,
    totalWfh,
    totalWfo: totalAsn - totalWfh,
    overallWfhPercentage: Math.round((totalWfh / totalAsn) * 100),
    kuotaMaxGlobal50Persen: Math.floor(totalAsn * 0.5),
    isGlobalQuotaCompliant: totalWfh <= Math.floor(totalAsn * 0.5),
    quotas,
  };
}

export const apiService = {
  // 1. Fetch Stats & Quota Calculations
  async getStats(tanggal?: string): Promise<StatsResponse> {
    try {
      const query = tanggal ? `?tanggal=${encodeURIComponent(tanggal)}` : '';
      const res = await fetch(`/api/stats${query}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    return calculateLocalStats(tanggal);
  },

  // 2. ASN Profiles
  async getAsnProfiles(unitId?: UnitKerjaId): Promise<ASNProfile[]> {
    try {
      const query = unitId ? `?unitKerjaId=${unitId}` : '';
      const res = await fetch(`/api/asn${query}`);
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.ASN, data);
        return data;
      }
    } catch {}
    const list = getLocal<ASNProfile[]>(STORAGE_KEYS.ASN, INITIAL_ASN_PROFILES);
    return unitId ? list.filter((a) => a.unitKerjaId === unitId) : list;
  },

  async updateAsnStatus(asnId: string, statusHariIni: 'WFO' | 'WFH' | 'DINAS_LUAR' | 'CUTI'): Promise<void> {
    try {
      await fetch(`/api/asn/${asnId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusHariIni }),
      });
    } catch {}
    const list = getLocal<ASNProfile[]>(STORAGE_KEYS.ASN, INITIAL_ASN_PROFILES);
    const target = list.find((a) => a.id === asnId);
    if (target) {
      target.statusHariIni = statusHariIni;
      setLocal(STORAGE_KEYS.ASN, list);
    }
  },

  // 3. FWA Requests with Strict 50% Quota Enforcement (Perpres 21/2023)
  async getFwaRequests(tanggal?: string, unitId?: UnitKerjaId): Promise<FwaRequest[]> {
    try {
      const params = new URLSearchParams();
      if (tanggal) params.append('tanggal', tanggal);
      if (unitId) params.append('unitKerjaId', unitId);
      const res = await fetch(`/api/fwa-requests?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.FWA, data);
        return data;
      }
    } catch {}
    let list = getLocal<FwaRequest[]>(STORAGE_KEYS.FWA, INITIAL_FWA_REQUESTS);
    if (tanggal) list = list.filter((r) => r.tanggal === tanggal);
    if (unitId) list = list.filter((r) => r.unitKerjaId === unitId);
    return list;
  },

  async submitFwaRequest(payload: {
    asnId: string;
    tanggal: string;
    jenisKerja: 'WFH' | 'WFO';
    alasanRencanaKerja: string;
    rencanaLuaranKinerja: string[];
  }): Promise<{ success: boolean; message: string; data?: FwaRequest; errorDetail?: string }> {
    try {
      const res = await fetch('/api/fwa-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: json.error || 'Pengajuan gagal diproses',
          errorDetail: json.detail || json.alasanHukum || 'Batas kuota 50% tercapai.',
        };
      }

      // Update local storage
      const list = getLocal<FwaRequest[]>(STORAGE_KEYS.FWA, INITIAL_FWA_REQUESTS);
      list.unshift(json.data);
      setLocal(STORAGE_KEYS.FWA, list);

      return {
        success: true,
        message: json.message,
        data: json.data,
      };
    } catch (err: any) {
      // Local fallback quota check
      const asnList = getLocal<ASNProfile[]>(STORAGE_KEYS.ASN, INITIAL_ASN_PROFILES);
      const asn = asnList.find((a) => a.id === payload.asnId);
      if (!asn) return { success: false, message: 'ASN tidak ditemukan.' };

      const unit = UNIT_KERJA_LIST.find((u) => u.id === asn.unitKerjaId);
      if (!unit) return { success: false, message: 'Unit kerja tidak valid.' };

      const fwaList = getLocal<FwaRequest[]>(STORAGE_KEYS.FWA, INITIAL_FWA_REQUESTS);
      const activeWfh = fwaList.filter(
        (r) => r.unitKerjaId === unit.id && r.tanggal === payload.tanggal && r.jenisKerja === 'WFH' && r.status === 'DISETUJUI'
      ).length;

      if (payload.jenisKerja === 'WFH' && activeWfh >= unit.kuotaMaksimalWfh) {
        return {
          success: false,
          message: 'PENGAJUAN WFH DITOLAK (PERPRES NO. 21 TAHUN 2023)',
          errorDetail: `Batas maksimal kuota WFH 50% (${unit.kuotaMaksimalWfh} ASN) untuk ${unit.nama} telah tercapai pada tanggal ${payload.tanggal}. Anda diwajibkan bertugas WFO untuk menjaga operasional kampus diklat BPSDM Jatim.`,
        };
      }

      const newReq: FwaRequest = {
        id: `fwa-${Date.now()}`,
        asnId: asn.id,
        asnNama: asn.nama,
        asnNip: asn.nip,
        unitKerjaId: asn.unitKerjaId,
        subBidang: asn.subBidang,
        tanggal: payload.tanggal,
        jenisKerja: payload.jenisKerja,
        alasanRencanaKerja: payload.alasanRencanaKerja,
        rencanaLuaranKinerja: payload.rencanaLuaranKinerja,
        status: 'DISETUJUI',
        catatanAtasan: `Disetujui otomatis sesuai regulasi kuota WFH ${unit.nama}.`,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };

      fwaList.unshift(newReq);
      setLocal(STORAGE_KEYS.FWA, fwaList);

      return {
        success: true,
        message: `Pengajuan ${payload.jenisKerja} disetujui sesuai regulasi.`,
        data: newReq,
      };
    }
  },

  async verifyFwaRequest(id: string, status: 'DISETUJUI' | 'DITOLAK', catatan?: string): Promise<void> {
    try {
      await fetch(`/api/fwa-requests/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, catatanAtasan: catatan }),
      });
    } catch {}

    const list = getLocal<FwaRequest[]>(STORAGE_KEYS.FWA, INITIAL_FWA_REQUESTS);
    const target = list.find((r) => r.id === id);
    if (target) {
      target.status = status;
      if (catatan) target.catatanAtasan = catatan;
      setLocal(STORAGE_KEYS.FWA, list);
    }
  },

  // 4. Output-Oriented SKP Items (PermenPANRB 6/2022)
  async getSkpOutputs(asnId?: string, tanggal?: string): Promise<SkpOutputItem[]> {
    try {
      const params = new URLSearchParams();
      if (asnId) params.append('asnId', asnId);
      if (tanggal) params.append('tanggal', tanggal);
      const res = await fetch(`/api/skp-outputs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.SKP, data);
        return data;
      }
    } catch {}
    let list = getLocal<SkpOutputItem[]>(STORAGE_KEYS.SKP, INITIAL_SKP_OUTPUTS);
    if (asnId) list = list.filter((i) => i.asnId === asnId);
    if (tanggal) list = list.filter((i) => i.tanggal === tanggal);
    return list;
  },

  async submitSkpOutput(payload: {
    asnId: string;
    kategoriKediklatan: any;
    uraianTugas: string;
    targetKuantitas: number;
    satuanOutput: string;
    realisasiKuantitas: number;
    tautanEvidenDrive: string;
    namaFileEviden: string;
    tanggal?: string;
  }): Promise<SkpOutputItem> {
    try {
      const res = await fetch('/api/skp-outputs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    const asnList = getLocal<ASNProfile[]>(STORAGE_KEYS.ASN, INITIAL_ASN_PROFILES);
    const asn = asnList.find((a) => a.id === payload.asnId) || INITIAL_ASN_PROFILES[0];

    const newItem: SkpOutputItem = {
      id: `skp-${Date.now()}`,
      asnId: asn.id,
      asnNama: asn.nama,
      unitKerjaId: asn.unitKerjaId,
      tanggal: payload.tanggal || new Date().toISOString().split('T')[0],
      kategoriKediklatan: payload.kategoriKediklatan,
      uraianTugas: payload.uraianTugas,
      targetKuantitas: payload.targetKuantitas,
      satuanOutput: payload.satuanOutput,
      realisasiKuantitas: payload.realisasiKuantitas,
      tautanEvidenDrive: payload.tautanEvidenDrive,
      namaFileEviden: payload.namaFileEviden,
      statusCapaian: payload.realisasiKuantitas >= payload.targetKuantitas ? 'SELESAI' : 'DALAM_PROSES',
      ratingAtasan: 'SESUAI_EKSPEKTASI',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    const list = getLocal<SkpOutputItem[]>(STORAGE_KEYS.SKP, INITIAL_SKP_OUTPUTS);
    list.unshift(newItem);
    setLocal(STORAGE_KEYS.SKP, list);
    return newItem;
  },

  async rateSkpOutput(id: string, ratingAtasan: 'DI_ATAS_EKSPEKTASI' | 'SESUAI_EKSPEKTASI' | 'DI_BAWAH_EKSPEKTASI', umpanBalik: string): Promise<void> {
    try {
      await fetch(`/api/skp-outputs/${id}/rate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratingAtasan, umpanBalikAtasan: umpanBalik }),
      });
    } catch {}

    const list = getLocal<SkpOutputItem[]>(STORAGE_KEYS.SKP, INITIAL_SKP_OUTPUTS);
    const item = list.find((i) => i.id === id);
    if (item) {
      item.ratingAtasan = ratingAtasan;
      item.umpanBalikAtasan = umpanBalik;
      setLocal(STORAGE_KEYS.SKP, list);
    }
  },

  // 5. Diklat Agendas
  async getAgendas(): Promise<DiklatAgenda[]> {
    try {
      const res = await fetch('/api/agendas');
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.AGENDAS, data);
        return data;
      }
    } catch {}
    return getLocal<DiklatAgenda[]>(STORAGE_KEYS.AGENDAS, INITIAL_DIKLAT_AGENDAS);
  },

  async createAgenda(agenda: Omit<DiklatAgenda, 'id' | 'status'>): Promise<DiklatAgenda> {
    try {
      const res = await fetch('/api/agendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agenda),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    const newAgenda: DiklatAgenda = {
      ...agenda,
      id: `dkt-${Date.now()}`,
      status: 'PERSIAPAN',
    };
    const list = getLocal<DiklatAgenda[]>(STORAGE_KEYS.AGENDAS, INITIAL_DIKLAT_AGENDAS);
    list.unshift(newAgenda);
    setLocal(STORAGE_KEYS.AGENDAS, list);
    return newAgenda;
  },

  // 6. EPP Surveys
  async getEppSurveys(): Promise<EppSurveyRecord[]> {
    try {
      const res = await fetch('/api/epp-surveys');
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.EPP, data);
        return data;
      }
    } catch {}
    return getLocal<EppSurveyRecord[]>(STORAGE_KEYS.EPP, INITIAL_EPP_SURVEYS);
  },

  // 7. Google Chat Space Notification Webhook
  async sendChatWebhook(title: string, message: string, tipe: string, sender: string): Promise<any> {
    try {
      const res = await fetch('/api/chat-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, tipe, sender }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, localBroadcast: true };
  },

  // 8. Gemini AI Consultation
  async consultAi(prompt: string, context?: any): Promise<string> {
    try {
      const res = await fetch('/api/ai/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.reply;
      }
    } catch {}
    return 'Gagal menghubungi server asisten AI. Silakan periksa koneksi internet atau gunakan panduan manual SPBE BPSDM Jatim.';
  },

  // 9. Gemini AI Workforce & Quota Analytics
  async analyzeWorkforce(
    analysisType: 'OVERALL_COMPLIANCE' | 'WORKLOAD_ANOMALY' | 'H1_FORECAST' | 'EXECUTIVE_BRIEF',
    workforceData?: any
  ): Promise<{ analysis: string; isAiGenerated: boolean }> {
    try {
      const res = await fetch('/api/ai/analyze-workforce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisType, workforceData }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    return {
      analysis: 'Analisis SPBE BPSDM Jatim: Seluruh operasional 5 unit kerja SOTK berjalan tertib sesuai ketentuan SE No. 800/1141/204/2026 (WFA hingga 100%) dan Pergub Jatim No. 71/2023. Kesiapsiagaan sarana fisik Kampus Utama Balongsari Surabaya terpantau optimal.',
      isAiGenerated: false,
    };
  },
};
