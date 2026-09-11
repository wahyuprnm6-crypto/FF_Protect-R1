import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  X, 
  CheckCircle2, 
  Maximize2, 
  GraduationCap, 
  Sparkles, 
  Camera,
  ExternalLink,
  Layers
} from 'lucide-react';
import { BPSDM_PHOTOS, BpsdmPhoto } from '../data/bpsdmAssets';

interface BpsdmCampusGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BpsdmCampusGalleryModal: React.FC<BpsdmCampusGalleryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activePhoto, setActivePhoto] = useState<BpsdmPhoto | null>(BPSDM_PHOTOS[0]);

  if (!isOpen) return null;

  const categories = [
    { id: 'ALL', label: 'Semua Dokumentasi' },
    { id: 'KAMPUS_SURABAYA', label: 'Kampus Balongsari Surabaya' },
    { id: 'KEGIATAN_DIKLAT', label: 'Kegiatan Diklat & Pelatihan' },
    { id: 'FASILITAS_UNGGULAN', label: 'Sasana & Lab CAT' },
    { id: 'INOVASI_DIGITAL', label: 'Inovasi Digital Si-Praja' },
  ];

  const filteredPhotos = selectedCategory === 'ALL'
    ? BPSDM_PHOTOS
    : BPSDM_PHOTOS.filter((p) => p.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full text-white shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Galeri Visual & Fasilitas Kampus BPSDM Jawa Timur
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                  BPSDM ONE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kampus Utama Jl. Balongsari Tama No. 1, Tandes, Surabaya • Sumber Dokumentasi: bpsdm.jatimprov.go.id
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2 overflow-x-auto bg-slate-900/50">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Featured Active Photo */}
          {activePhoto && (
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 shadow-xl">
              <div className="lg:col-span-8 relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={activePhoto.imageUrl}
                  alt={activePhoto.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-500/40">
                  {activePhoto.tag}
                </div>
              </div>

              <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-slate-900/90 border-t lg:border-t-0 lg:border-l border-slate-800">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{activePhoto.location}</span>
                  </div>
                  <h4 className="text-base font-bold text-white leading-snug">
                    {activePhoto.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activePhoto.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Infrastruktur BPSDM Jatim</span>
                  <span className="text-emerald-400 font-bold">Siap Operasional 100%</span>
                </div>
              </div>
            </div>
          )}

          {/* Photo Thumbnails Grid */}
          <div>
            <div className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2">
              <span>Pilih Dokumentasi Foto ({filteredPhotos.length} Foto)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setActivePhoto(photo)}
                  className={`group relative rounded-xl overflow-hidden aspect-4/3 cursor-pointer border transition-all ${
                    activePhoto?.id === photo.id
                      ? 'border-emerald-500 ring-2 ring-emerald-500/50 scale-[1.02]'
                      : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-end">
                    <span className="text-[10px] font-bold text-white line-clamp-1">
                      {photo.title}
                    </span>
                    <span className="text-[9px] text-emerald-300 line-clamp-1">
                      {photo.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div>
            Badan Pengembangan Sumber Daya Manusia • Pemerintah Provinsi Jawa Timur
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition text-xs"
          >
            Tutup Galeri
          </button>
        </div>
      </div>
    </div>
  );
};
