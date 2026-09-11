import React, { useRef, useState, useEffect } from 'react';
import { 
  PenTool, 
  Eraser, 
  RotateCcw, 
  Download, 
  Plus, 
  Trash2, 
  Palette, 
  Sparkles,
  StickyNote
} from 'lucide-react';
import { ASNProfile } from '../../types';

interface StickyNoteItem {
  id: string;
  author: string;
  text: string;
  color: 'yellow' | 'green' | 'blue' | 'pink';
  x: number;
  y: number;
}

interface VirtualWhiteboardProps {
  currentAsn: ASNProfile;
  onClose?: () => void;
}

export const VirtualWhiteboard: React.FC<VirtualWhiteboardProps> = ({ currentAsn }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState<string>('#10b981');
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [notes, setNotes] = useState<StickyNoteItem[]>([
    {
      id: 'note-1',
      author: 'Dr. Ramliyanto (Kepala BPSDM)',
      text: 'Prioritaskan sinkronisasi LMS Si-Praja dengan presensi digital 3x sehari.',
      color: 'yellow',
      x: 30,
      y: 40,
    },
    {
      id: 'note-2',
      author: 'Bidang PK Manajerial',
      text: 'Jadwal pembukaan PKN Tingkat II: Pastikan gladi bersih via Zoom selesai H-1.',
      color: 'green',
      x: 280,
      y: 60,
    },
    {
      id: 'note-3',
      author: 'Bidang PK Teknis & SPBE',
      text: 'Validasi radius GPS pegawai WFH dan pengunggahan link Google Drive luaran SKP.',
      color: 'blue',
      x: 520,
      y: 70,
    },
  ]);
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [newNoteColor, setNewNoteColor] = useState<StickyNoteItem['color']>('yellow');

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high resolution canvas
    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = 500;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw light grid pattern
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    const step = 30;
    for (let x = 0; x < canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'eraser') {
      ctx.strokeStyle = '#0f172a'; // Background color
      ctx.lineWidth = lineWidth * 4;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    const step = 30;
    for (let x = 0; x < canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const newNote: StickyNoteItem = {
      id: `note-${Date.now()}`,
      author: currentAsn.nama,
      text: newNoteText.trim(),
      color: newNoteColor,
      x: 50 + (notes.length % 4) * 180,
      y: 180 + Math.floor(notes.length / 4) * 80,
    };
    setNotes((prev) => [...prev, newNote]);
    setNewNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const colorOptions = ['#10b981', '#38bdf8', '#f59e0b', '#f43f5e', '#a855f7', '#ffffff'];

  const noteColorMap: Record<StickyNoteItem['color'], { bg: string; border: string; text: string }> = {
    yellow: { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-950' },
    green: { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-950' },
    blue: { bg: 'bg-sky-100', border: 'border-sky-300', text: 'text-sky-950' },
    pink: { bg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-950' },
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-slate-950/90 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-white z-20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
            <StickyNote className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold flex items-center gap-1.5 text-sm">
              <span>Papan Kolaborasi & Sketsa Ide Rapat BPSDM</span>
              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-1.5 py-0.2 rounded font-mono">
                WHITEBOARD
              </span>
            </h4>
            <span className="text-[10px] text-slate-400">
              Coretan diagram alur & catatan tempel (*sticky notes*) real-time
            </span>
          </div>
        </div>

        {/* Tools: Pen, Eraser, Colors, Size, Clear */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setTool('pen')}
              className={`p-1.5 rounded flex items-center gap-1 transition ${
                tool === 'pen' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Pena Coretan"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Pena</span>
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-1.5 rounded flex items-center gap-1 transition ${
                tool === 'eraser' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Penghapus Coretan"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Hapus</span>
            </button>
          </div>

          {/* Color palette */}
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
            {colorOptions.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setTool('pen');
                }}
                style={{ backgroundColor: c }}
                className={`w-4 h-4 rounded-full transition-transform ${
                  color === c && tool === 'pen' ? 'scale-125 ring-2 ring-white' : 'opacity-75 hover:opacity-100'
                }`}
              />
            ))}
          </div>

          {/* Line width */}
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400">Tebal:</span>
            {[2, 4, 8].map((w) => (
              <button
                key={w}
                onClick={() => setLineWidth(w)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  lineWidth === w ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                {w}px
              </button>
            ))}
          </div>

          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Bersihkan Semua Gambar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Drawing & Notes Stage */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden cursor-crosshair select-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="absolute inset-0 z-0 w-full h-full"
        />

        {/* Sticky Notes Layer */}
        <div className="absolute inset-0 z-10 pointer-events-none p-4">
          {notes.map((n) => {
            const style = noteColorMap[n.color] || noteColorMap.yellow;
            return (
              <div
                key={n.id}
                style={{ left: `${n.x}px`, top: `${n.y}px` }}
                className={`absolute pointer-events-auto w-56 p-3 rounded-xl shadow-xl border ${style.bg} ${style.border} ${style.text} transition hover:scale-102`}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold font-mono opacity-80 uppercase truncate">
                    {n.author}
                  </span>
                  <button
                    onClick={() => handleDeleteNote(n.id)}
                    className="p-1 hover:bg-black/10 rounded transition text-slate-600"
                    title="Hapus Catatan"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs leading-snug font-medium font-sans">
                  {n.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Sticky Note Creator Bar */}
      <div className="bg-slate-950/95 border-t border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 z-20 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <input
            type="text"
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddNote();
            }}
            placeholder="Tulis catatan tempel baru untuk didiskusikan bersama..."
            className="flex-1 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-hidden focus:border-cyan-400 placeholder:text-slate-500"
          />

          {/* Color picker for note */}
          <div className="flex items-center gap-1">
            {(['yellow', 'green', 'blue', 'pink'] as const).map((clr) => (
              <button
                key={clr}
                onClick={() => setNewNoteColor(clr)}
                className={`w-4 h-4 rounded-full border border-black/20 ${
                  clr === 'yellow'
                    ? 'bg-amber-300'
                    : clr === 'green'
                    ? 'bg-emerald-300'
                    : clr === 'blue'
                    ? 'bg-sky-300'
                    : 'bg-rose-300'
                } ${newNoteColor === clr ? 'ring-2 ring-white scale-110' : 'opacity-70'}`}
              />
            ))}
          </div>

          <button
            onClick={handleAddNote}
            disabled={!newNoteText.trim()}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold flex items-center gap-1 transition shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tempel</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 hidden md:inline">
          Tips: Klik & seret mouse pada kanvas untuk menggambar diagram alur rapat.
        </span>
      </div>
    </div>
  );
};
