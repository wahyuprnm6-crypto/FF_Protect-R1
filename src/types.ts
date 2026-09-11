export type UnitKerjaId = 
  | 'sekretariat'
  | 'pk_manajerial'
  | 'pk_fungsional_soskul'
  | 'pk_teknis'
  | 'upt_sertifikasi_sdm'
  | 'sertifikasi_penjaminan_mutu'; // Aliased for backward compatibility

export interface UnitKerja {
  id: UnitKerjaId;
  nama: string;
  singkatan: string;
  subBidang: string[];
  totalAsn: number;
  kuotaMaksimalWfh: number; // Hingga 100% sesuai SE No. 800/1141/204/2026
  deskripsiTugas: string;
  kepalaBidang: string;
  lokasiKampus?: string;
  isUpt?: boolean;
}

export type StatusKerja = 'WFO' | 'WFH' | 'DINAS_LUAR' | 'CUTI';

export type KategoriKediklatan = 
  | 'ADMINISTRASI_PESERTA'
  | 'KURIKULUM_MODUL'
  | 'KOORDINASI_WIDYAISWARA'
  | 'EVALUASI_PASCA_PELATIHAN'
  | 'LMS_SI_PRAJA';

export type StatusVerifikasi = 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK' | 'BUTUH_PERBAIKAN';

export interface ASNProfile {
  id: string;
  nip: string;
  nama: string;
  jabatan: string;
  unitKerjaId: UnitKerjaId;
  subBidang: string;
  role: 'STAFF' | 'WIDYAISWARA' | 'SUB_KOORDINATOR' | 'KEPALA_BIDANG' | 'ADMIN_KEPEGAWAIAN' | 'KEPALA_BPSDM';
  email: string;
  statusHariIni: StatusKerja;
  fotoUrl?: string;
  pangkatGolongan: string;
}

export interface FwaRequest {
  id: string;
  asnId: string;
  asnNama: string;
  asnNip: string;
  unitKerjaId: UnitKerjaId;
  subBidang: string;
  tanggal: string; // YYYY-MM-DD
  jenisKerja: 'WFH' | 'WFO';
  alasanRencanaKerja: string;
  rencanaLuaranKinerja: string[];
  status: StatusVerifikasi;
  catatanAtasan?: string;
  diverifikasiOleh?: string;
  createdAt: string;
  diverifikasiPada?: string;
}

export interface SkpOutputItem {
  id: string;
  asnId: string;
  asnNama: string;
  unitKerjaId: UnitKerjaId;
  tanggal: string; // YYYY-MM-DD
  kategoriKediklatan: KategoriKediklatan;
  uraianTugas: string;
  targetKuantitas: number;
  satuanOutput: string; // misal: Dokumen Modul, Rekap Peserta, Laporan EPP, Sesi Jam Tatap Muka
  realisasiKuantitas: number;
  tautanEvidenDrive: string;
  namaFileEviden: string;
  statusCapaian: 'SELESAI' | 'DALAM_PROSES' | 'TERKENDALA';
  ratingAtasan?: 'DI_ATAS_EKSPEKTASI' | 'SESUAI_EKSPEKTASI' | 'DI_BAWAH_EKSPEKTASI';
  umpanBalikAtasan?: string;
  createdAt: string;
}

export interface DiklatAgenda {
  id: string;
  namaDiklat: string;
  unitKerjaId: UnitKerjaId;
  widyaiswaraNama: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  waktu: string;
  jumlahPeserta: number;
  metode: 'BLENDED_LEARNING' | 'KLASIKAL' | 'E_LEARNING_SI_PRAJA';
  ruangAtauMeetLink: string;
  status: 'BERJALAN' | 'PERSIAPAN' | 'SELESAI';
  googleEventId?: string;
}

export interface EppSurveyRecord {
  id: string;
  namaPelatihan: string;
  angkatanTahun: string;
  jumlahAlumni: number;
  indeksKepuasanAlumni: number; // Skala 1-100
  indeksKemanfaatanInstansi: number; // Skala 1-100
  statusEvaluasi: 'SURVEI_BERJALAN' | 'ANALISIS_DATA' | 'LAPORAN_TERBIT';
  tautanLaporanDrive: string;
}

export interface QuotaCalculation {
  unitKerjaId: UnitKerjaId;
  unitKerjaNama: string;
  totalAsn: number;
  maksimalWfh: number; // Hingga 100% sesuai SE No. 800/1141/204/2026
  jumlahWfhHariIni: number;
  jumlahWfoHariIni: number;
  persentaseWfh: number;
  kuotaTersediaWfh: number;
  isQuotaExceeded: boolean;
  statusLayananFisik: 'OPTIMAL' | 'WASPADA' | 'KRITIS';
  isUpt?: boolean;
}

export interface GoogleWorkspaceState {
  isSignedIn: boolean;
  userEmail: string | null;
  userName: string | null;
  userPhoto: string | null;
  accessToken: string | null;
}

export type UserMode = 'PEGAWAI' | 'PIMPINAN_KEPALA_BPSDM';

export interface PresensiRecord {
  id: string;
  asnId: string;
  asnNama: string;
  asnNip: string;
  unitKerja: string;
  jenisKerja: 'WFH' | 'WFO';
  tipe: 'MASUK' | 'SIANG' | 'PULANG'; // 3 kali sehari sesuai SE No. 800/1141/204/2026
  jam: string;
  tanggal: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  alamatLokasi: string;
  statusGeolokasi: 'VALID_RADIUS_KAMPUS' | 'VALID_KEDIAMAN_TERDAFTAR' | 'DILUAR_JANGKAUAN';
  createdAt: string;
}

export interface DailyTask {
  id: string;
  asnId: string;
  asnNama: string;
  asnNip: string;
  bidang: string;
  judulTugas: string;
  kategori: KategoriKediklatan;
  targetKuantitas: number;
  satuan: string;
  progres: 0 | 50 | 100;
  evidenceUrl: string;
  evidenceFileName: string;
  status: 'BELUM_MULAI' | 'PROSES' | 'SELESAI';
  tanggal: string;
  catatanPimpinan?: string;
  createdAt: string;
}

