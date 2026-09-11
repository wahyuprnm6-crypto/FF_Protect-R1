import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  ShieldCheck, 
  Building2, 
  Mail, 
  IdCard, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Download, 
  RefreshCw, 
  Sparkles,
  Award,
  Layers,
  Phone,
  User,
  Key
} from 'lucide-react';
import { ASNProfile, UnitKerjaId, StatusKerja } from '../types';
import { UNIT_KERJA_LIST } from '../data/mockData';

interface AsnManagementSectionProps {
  currentAsn: ASNProfile;
  allAsn: ASNProfile[];
  onAddAsn: (newProfile: ASNProfile) => void;
  onUpdateAsn: (updatedProfile: ASNProfile) => void;
  onDeleteAsn: (asnId: string) => void;
  onResetToDefault: () => void;
  onSwitchToKepalaBpsdm?: () => void;
}

const PANGKAT_GOLONGAN_OPTIONS = [
  'Juru Muda (I/a)',
  'Juru Muda Tingkat I (I/b)',
  'Juru (I/c)',
  'Juru Tingkat I (I/d)',
  'Pengatur Muda (II/a)',
  'Pengatur Muda Tingkat I (II/b)',
  'Pengatur (II/c)',
  'Pengatur Tingkat I (II/d)',
  'Penata Muda (III/a)',
  'Penata Muda Tingkat I (III/b)',
  'Penata (III/c)',
  'Penata Tingkat I (III/d)',
  'Pembina (IV/a)',
  'Pembina Tingkat I (IV/b)',
  'Pembina Utama Muda (IV/c)',
  'Pembina Utama Madya (IV/d)',
  'Pembina Utama (IV/e)',
];

const ROLE_OPTIONS: Array<{ value: ASNProfile['role']; label: string }> = [
  { value: 'STAFF', label: 'Pelaksana / Staf Fungsional Teknis' },
  { value: 'WIDYAISWARA', label: 'Widyaiswara (Ahli Pertama / Muda / Madya / Utama)' },
  { value: 'SUB_KOORDINATOR', label: 'Sub Koordinator / Ketua Tim Kerja' },
  { value: 'KEPALA_BIDANG', label: 'Kepala Bidang / Sekretaris / Kepala UPT' },
  { value: 'ADMIN_KEPEGAWAIAN', label: 'Admin Kepegawaian & Verifikator SPBE' },
  { value: 'KEPALA_BPSDM', label: 'Kepala Badan Pengembangan SDM (Pimpinan Tinggi)' },
];

export const AsnManagementSection: React.FC<AsnManagementSectionProps> = ({
  currentAsn,
  allAsn,
  onAddAsn,
  onUpdateAsn,
  onDeleteAsn,
  onResetToDefault,
  onSwitchToKepalaBpsdm,
}) => {
  const isKepalaBpsdm = currentAsn.role === 'KEPALA_BPSDM';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ASNProfile | null>(null);

  // Delete Confirmation State
  const [deletingAsn, setDeletingAsn] = useState<ASNProfile | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ASNProfile>>({
    nama: '',
    nip: '',
    jabatan: '',
    unitKerjaId: 'sekretariat',
    subBidang: '',
    role: 'STAFF',
    pangkatGolongan: 'Penata (III/c)',
    email: '',
    statusHariIni: 'WFH',
    fotoUrl: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Auto-fill subBidang when unit changes if empty
  const handleUnitChange = (unitId: UnitKerjaId) => {
    const targetUnit = UNIT_KERJA_LIST.find((u) => u.id === unitId);
    setFormData((prev) => ({
      ...prev,
      unitKerjaId: unitId,
      subBidang: targetUnit?.subBidang[0] || '',
    }));
  };

  // Open modal for Adding
  const handleOpenAddModal = () => {
    setEditingProfile(null);
    setFormData({
      nama: '',
      nip: '19' + Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString().substring(0, 16),
      jabatan: 'Pranata Komputer Ahli Pertama',
      unitKerjaId: 'sekretariat',
      subBidang: 'Subbag Tata Usaha & Kepegawaian',
      role: 'STAFF',
      pangkatGolongan: 'Penata Muda Tingkat I (III/b)',
      email: '',
      statusHariIni: 'WFH',
      fotoUrl: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEditModal = (profile: ASNProfile) => {
    setEditingProfile(profile);
    setFormData({
      ...profile,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save Form (Add or Edit)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama?.trim()) {
      setFormError('Nama lengkap pegawai tidak boleh kosong.');
      return;
    }
    if (!formData.nip?.trim() || formData.nip.trim().length < 8) {
      setFormError('NIP pegawai harus valid (minimal 8-18 digit angka).');
      return;
    }
    if (!formData.email?.trim() || !formData.email.includes('@')) {
      setFormError('Alamat email kedinasan Google harus valid.');
      return;
    }
    if (!formData.jabatan?.trim()) {
      setFormError('Jabatan kedinasan harus diisi.');
      return;
    }

    if (editingProfile) {
      // Update existing
      const updated: ASNProfile = {
        ...editingProfile,
        nama: formData.nama.trim(),
        nip: formData.nip.trim(),
        jabatan: formData.jabatan.trim(),
        unitKerjaId: (formData.unitKerjaId as UnitKerjaId) || 'sekretariat',
        subBidang: formData.subBidang?.trim() || 'Unit Pelaksana',
        role: formData.role || 'STAFF',
        pangkatGolongan: formData.pangkatGolongan || 'Penata (III/c)',
        email: formData.email.trim(),
        statusHariIni: (formData.statusHariIni as StatusKerja) || 'WFH',
        fotoUrl: formData.fotoUrl?.trim() || undefined,
      };
      onUpdateAsn(updated);
    } else {
      // Create new
      const newAsn: ASNProfile = {
        id: `asn-${Date.now()}`,
        nama: formData.nama.trim(),
        nip: formData.nip.trim(),
        jabatan: formData.jabatan.trim(),
        unitKerjaId: (formData.unitKerjaId as UnitKerjaId) || 'sekretariat',
        subBidang: formData.subBidang?.trim() || 'Unit Pelaksana',
        role: formData.role || 'STAFF',
        pangkatGolongan: formData.pangkatGolongan || 'Penata (III/c)',
        email: formData.email.trim(),
        statusHariIni: (formData.statusHariIni as StatusKerja) || 'WFH',
        fotoUrl: formData.fotoUrl?.trim() || undefined,
      };
      onAddAsn(newAsn);
    }

    setIsModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingAsn) return;
    if (deletingAsn.id === currentAsn.id) {
      alert('Tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.');
      setDeletingAsn(null);
      return;
    }
    onDeleteAsn(deletingAsn.id);
    setDeletingAsn(null);
  };

  // Filtered ASN List
  const filteredAsn = useMemo(() => {
    return allAsn.filter((asn) => {
      const matchSearch =
        searchTerm === '' ||
        asn.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asn.nip.includes(searchTerm) ||
        asn.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asn.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchUnit = selectedUnit === 'ALL' || asn.unitKerjaId === selectedUnit;
      const matchRole = selectedRole === 'ALL' || asn.role === selectedRole;

      return matchSearch && matchUnit && matchRole;
    });
  }, [allAsn, searchTerm, selectedUnit, selectedRole]);

  // Quick statistics
  const stats = useMemo(() => {
    const total = allAsn.length;
    const wfa = allAsn.filter((a) => a.statusHariIni === 'WFH').length;
    const wfo = allAsn.filter((a) => a.statusHariIni === 'WFO').length;
    const widyaiswara = allAsn.filter((a) => a.role === 'WIDYAISWARA').length;
    const pejabat = allAsn.filter((a) => a.role === 'KEPALA_BIDANG' || a.role === 'KEPALA_BPSDM').length;

    return { total, wfa, wfo, widyaiswara, pejabat };
  }, [allAsn]);

  // Export JSON
  const handleExportRoster = () => {
    const jsonStr = JSON.stringify(allAsn, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BPSDM_ONE_Pegawai_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Executive Authorization Header */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 border border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-linear-to-l from-amber-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-extrabold px-3 py-1 rounded-full mb-2">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>OTORITAS EKSKLUSIF KEPALA BPSDM PROVINSI JAWA TIMUR</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Manajemen Data Pegawai ASN & Roster Kedinasan</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Hak kelola pembina kepegawaian untuk menambah ASN baru, memperbarui identitas dan jabatan kedinasan, serta menonaktifkan pegawai di 5 Unit Kerja BPSDM Jatim (Pergub 71/2023 & SE 800/1141/204/2026).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isKepalaBpsdm && onSwitchToKepalaBpsdm && (
              <button
                onClick={onSwitchToKepalaBpsdm}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Ganti Akun ke Kepala BPSDM</span>
              </button>
            )}

            <button
              onClick={handleOpenAddModal}
              id="btn-add-asn"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Pegawai Baru</span>
            </button>
          </div>
        </div>

        {/* 5 Quick KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-4 border-t border-slate-700/60">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-2.5">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total ASN Terdaftar</div>
            <div className="text-lg font-black text-white mt-0.5">{stats.total} ASN</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-2.5">
            <div className="text-[10px] uppercase font-bold text-slate-400">Tugas Fleksibel (WFA)</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">
              {stats.wfa} ASN ({Math.round((stats.wfa / (stats.total || 1)) * 100)}%)
            </div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-2.5">
            <div className="text-[10px] uppercase font-bold text-slate-400">Tugas Kampus (WFO)</div>
            <div className="text-lg font-black text-blue-400 mt-0.5">{stats.wfo} ASN</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-2.5">
            <div className="text-[10px] uppercase font-bold text-slate-400">Widyaiswara Pengampu</div>
            <div className="text-lg font-black text-purple-400 mt-0.5">{stats.widyaiswara} WI</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-2.5">
            <div className="text-[10px] uppercase font-bold text-slate-400">Pimpinan & Pejabat</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">{stats.pejabat} Pejabat</div>
          </div>
        </div>
      </div>

      {/* Control Toolbar: Search, Filters, View Modes, & Export */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama pegawai, NIP, jabatan, atau email..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
            />
          </div>

          {/* Unit Filter */}
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 text-slate-700 font-medium px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">Semua 5 Unit Kerja SOTK</option>
            {UNIT_KERJA_LIST.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.singkatan} ({unit.nama})
              </option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 text-slate-700 font-medium px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">Semua Peran Kedinasan</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Switcher & Export */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'TABLE' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tabel
            </button>
            <button
              onClick={() => setViewMode('CARDS')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'CARDS' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Kartu
            </button>
          </div>

          <button
            onClick={handleExportRoster}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition text-xs font-semibold flex items-center gap-1.5"
            title="Ekspor Data JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Ekspor Data</span>
          </button>

          <button
            onClick={onResetToDefault}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition text-xs font-semibold flex items-center gap-1.5"
            title="Reset ke Data Awal BPSDM"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset Awal</span>
          </button>
        </div>
      </div>

      {/* Main Table / Grid View */}
      {viewMode === 'TABLE' ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Pegawai / NIP</th>
                  <th className="px-4 py-3">Jabatan & Pangkat</th>
                  <th className="px-4 py-3">Unit Kerja & Sub-Bidang</th>
                  <th className="px-4 py-3">Role / Akun</th>
                  <th className="px-4 py-3">Status Hari Ini</th>
                  <th className="px-4 py-3 text-right">Aksi Kepala Badan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredAsn.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      Tidak ada data pegawai yang sesuai dengan kata kunci pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredAsn.map((asn) => {
                    const unitInfo = UNIT_KERJA_LIST.find((u) => u.id === asn.unitKerjaId);
                    const isSelf = asn.id === currentAsn.id;

                    return (
                      <tr key={asn.id} className="hover:bg-slate-50/80 transition">
                        {/* Nama & NIP */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {asn.nama.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                {asn.nama}
                                {isSelf && (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded">
                                    ANDA
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">NIP. {asn.nip}</div>
                              <div className="text-[10px] text-slate-400 truncate">{asn.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Jabatan & Pangkat */}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{asn.jabatan}</div>
                          <div className="text-[11px] text-emerald-800 font-medium mt-0.5">
                            {asn.pangkatGolongan}
                          </div>
                        </td>

                        {/* Unit Kerja */}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{unitInfo?.singkatan || asn.unitKerjaId}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">{asn.subBidang}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {unitInfo?.lokasiKampus || 'Kampus Balongsari'}
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                              asn.role === 'KEPALA_BPSDM'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : asn.role === 'KEPALA_BIDANG'
                                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                : asn.role === 'WIDYAISWARA'
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {asn.role}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                              asn.statusHariIni === 'WFH'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : asn.statusHariIni === 'WFO'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                asn.statusHariIni === 'WFH' ? 'bg-emerald-500' : 'bg-blue-500'
                              }`}
                            />
                            {asn.statusHariIni === 'WFH' ? 'WFA (Fleksibel)' : 'WFO (Kampus)'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(asn)}
                              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition"
                              title="Edit Identitas Pegawai"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingAsn(asn)}
                              disabled={isSelf}
                              className={`p-1.5 rounded-lg transition ${
                                isSelf
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                              }`}
                              title={isSelf ? 'Tidak dapat menghapus akun Anda sendiri' : 'Hapus Pegawai'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAsn.map((asn) => {
            const unitInfo = UNIT_KERJA_LIST.find((u) => u.id === asn.unitKerjaId);
            const isSelf = asn.id === currentAsn.id;

            return (
              <div
                key={asn.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                        {asn.nama.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 line-clamp-1">{asn.nama}</div>
                        <div className="text-[10px] text-slate-500 font-mono">NIP. {asn.nip}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        asn.role === 'KEPALA_BPSDM'
                          ? 'bg-amber-100 text-amber-900'
                          : asn.role === 'WIDYAISWARA'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {asn.role}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-xs border-t border-slate-100 pt-2.5">
                    <div className="text-slate-800 font-semibold">{asn.jabatan}</div>
                    <div className="text-[11px] text-emerald-700">{asn.pangkatGolongan}</div>
                    <div className="text-[11px] text-slate-500">{unitInfo?.nama}</div>
                    <div className="text-[10px] text-slate-400 truncate">{asn.email}</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                      asn.statusHariIni === 'WFH'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        asn.statusHariIni === 'WFH' ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                    />
                    {asn.statusHariIni}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(asn)}
                      className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition"
                      title="Edit Pegawai"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingAsn(asn)}
                      disabled={isSelf}
                      className={`p-1.5 rounded-lg transition ${
                        isSelf
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                      }`}
                      title="Hapus Pegawai"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Tambah / Edit Data Pegawai ASN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  {editingProfile ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingProfile ? 'Edit Identitas Pegawai ASN' : 'Pendaftaran Pegawai ASN Baru'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Otoritas Pimpinan Tinggi BPSDM Provinsi Jawa Timur
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Row 1: Nama Lengkap & NIP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap & Gelar: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama || ''}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Dr. Tri Bagus Prabowo, S.STP, M.M"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Induk Pegawai (NIP): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nip || ''}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="198905202014031002 (18 digit)"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Jabatan & Pangkat/Golongan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan Kedinasan: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jabatan || ''}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    placeholder="Contoh: Widyaiswara Ahli Madya / Pranata Komputer"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pangkat & Golongan Ruang:
                  </label>
                  <select
                    value={formData.pangkatGolongan || 'Penata (III/c)'}
                    onChange={(e) => setFormData({ ...formData, pangkatGolongan: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                  >
                    {PANGKAT_GOLONGAN_OPTIONS.map((pg) => (
                      <option key={pg} value={pg}>
                        {pg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Unit Kerja SOTK (5 Unit) & Sub-Bidang */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unit Kerja SOTK (Pergub Jatim No. 71/2023): <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.unitKerjaId || 'sekretariat'}
                    onChange={(e) => handleUnitChange(e.target.value as UnitKerjaId)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                  >
                    {UNIT_KERJA_LIST.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.nama} ({unit.singkatan})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sub-Bidang / Seksi / Urusan:
                  </label>
                  <input
                    type="text"
                    value={formData.subBidang || ''}
                    onChange={(e) => setFormData({ ...formData, subBidang: e.target.value })}
                    placeholder="Contoh: Subbidang Latsar CPNS / Tim SPBE"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Row 4: Email Google Workspace & Peran (Role) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Google ASN: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama.pegawai@jatimprov.go.id"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Digunakan untuk Google SSO & sinkronisasi Google Workspace.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Peran Kedinasan (Role):
                  </label>
                  <select
                    value={formData.role || 'STAFF'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as ASNProfile['role'] })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Status Hari Ini & Foto URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Kerja Fleksibilitas Hari Ini:
                  </label>
                  <select
                    value={formData.statusHariIni || 'WFH'}
                    onChange={(e) => setFormData({ ...formData, statusHariIni: e.target.value as StatusKerja })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                  >
                    <option value="WFH">WFH / WFA (Tugas Kedinasan Fleksibel 100%)</option>
                    <option value="WFO">WFO (Tugas Fisik Kampus Balongsari Surabaya)</option>
                    <option value="DINAS_LUAR">Dinas Luar Daerah</option>
                    <option value="CUTI">Cuti Tahunan / Alasan Penting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tautan Foto Profil (Opsional):
                  </label>
                  <input
                    type="url"
                    value={formData.fotoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-300 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingProfile ? 'Simpan Perubahan' : 'Daftarkan Pegawai'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: Hapus Pegawai */}
      {deletingAsn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              Konfirmasi Penghapusan Pegawai ASN
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus data pegawai <strong className="text-slate-900">{deletingAsn.nama}</strong> (NIP: {deletingAsn.nip}) dari roster kedinasan BPSDM Jatim?
            </p>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mt-3 text-[11px] text-rose-800">
              Peringatan: Tindakan ini akan menonaktifkan akun pegawai dari sistem BPSDM ONE dan menghapus kuota unit terkait.
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingAsn(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-300 transition"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Pegawai</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
