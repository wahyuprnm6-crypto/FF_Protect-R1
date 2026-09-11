export interface BpsdmPhoto {
  id: string;
  title: string;
  category: 'KAMPUS_SURABAYA' | 'KEGIATAN_DIKLAT' | 'FASILITAS_UNGGULAN' | 'INOVASI_DIGITAL';
  location: string;
  imageUrl: string;
  description: string;
  tag: string;
}

/**
 * Galeri Dokumentasi Resmi Fasilitas & Kegiatan Kedinasan BPSDM Provinsi Jawa Timur
 * Berdasarkan sumber resmi Portal BPSDM Jatim (https://bpsdm.jatimprov.go.id)
 * Kampus Utama berlokasi di Jl. Balongsari Tama No. 1, Tandes, Surabaya 60186.
 */
export const BPSDM_PHOTOS: BpsdmPhoto[] = [
  {
    id: 'photo-kampus-balongsari',
    title: 'Gedung Utama BPSDM Provinsi Jawa Timur',
    category: 'KAMPUS_SURABAYA',
    location: 'Jl. Balongsari Tama No. 1, Tandes, Surabaya',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    description: 'Pusat komando kedinasan BPSDM Jatim, ruang kerja pimpinan, sekretariat, dan layanan integrasi SPBE Corporate University.',
    tag: 'Kampus Utama Surabaya',
  },
  {
    id: 'photo-sasana-bhakti',
    title: 'Auditorium Sasana Bhakti Praja',
    category: 'FASILITAS_UNGGULAN',
    location: 'Kampus Utama Balongsari, Surabaya',
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
    description: 'Auditorium megah berkapasitas 500 kursi untuk upacara pembukaan dan pelepasan Pelatihan Kepemimpinan Nasional (PKN Tk. II) dan Latsar CPNS.',
    tag: 'Sasana Bhakti Praja',
  },
  {
    id: 'photo-diklat-pkn',
    title: 'Pelatihan Kepemimpinan Nasional (PKN) Tingkat II',
    category: 'KEGIATAN_DIKLAT',
    location: 'Sasana Wiyata BPSDM Jatim, Surabaya',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    description: 'Sesi bimbingan proyek perubahan inovasi birokrasi bagi pejabat pimpinan tinggi pratama (Eselon II) se-Indonesia dengan kurikulum LAN RI.',
    tag: 'PKN Tingkat II & PKA',
  },
  {
    id: 'photo-latsar-cpns',
    title: 'Pelatihan Dasar (Latsar) CPNS BerAKHLAK',
    category: 'KEGIATAN_DIKLAT',
    location: 'Lapangan Upacara & Kelas Kampus Balongsari',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    description: 'Pembentukan integritas, nilai BerAKHLAK, kedisiplinan bela negara, dan profesionalisme bagi tunas muda ASN Pemerintah Provinsi Jawa Timur.',
    tag: 'Latsar CPNS & PPPK',
  },
  {
    id: 'photo-smart-classroom',
    title: 'Smart Classroom & Hybrid Learning Lab',
    category: 'INOVASI_DIGITAL',
    location: 'Gedung Wiyata Digital BPSDM Jatim, Surabaya',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    description: 'Ruang kelas pintar berteknologi interactive smartboard dan streaming multi-kamera untuk memfasilitasi pembelajaran hybrid WFA.',
    tag: 'Smart Classroom SPBE',
  },
  {
    id: 'photo-lab-cat',
    title: 'Laboratorium Asesmen & CAT UPT Sertifikasi',
    category: 'FASILITAS_UNGGULAN',
    location: 'Gedung Diklat Balongsari, Surabaya',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    description: 'Fasilitas 120 workstation CAT terakreditasi BKN & BNSP untuk uji kompetensi teknis, manajerial, dan sertifikasi profesi ASN.',
    tag: 'Assessment Center & CAT',
  },
  {
    id: 'photo-graha-wiyata',
    title: 'Graha Wiyata (Asrama Kedinasan Peserta)',
    category: 'KAMPUS_SURABAYA',
    location: 'Kompleks Kampus Balongsari, Surabaya',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    description: 'Fasilitas akomodasi peserta diklat klasikal berkapasitas 350 kamar berstandar hotel berbintang dengan lingkungan hijau asri.',
    tag: 'Wisma & Asrama Peserta',
  },
  {
    id: 'photo-studio-sipraja',
    title: 'Studio Multimedia & Podcast Kedinasan PAWON',
    category: 'INOVASI_DIGITAL',
    location: 'Digital Center BPSDM Jatim, Surabaya',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    description: 'Studio produksi bahan ajar video microlearning Si-Praja dan siaran bincang edukatif Pojok Wawasan Online (PAWON) Jawa Timur.',
    tag: 'Studio Si-Praja & Pawon',
  },
];
