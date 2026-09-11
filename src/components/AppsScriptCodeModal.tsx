import React, { useState } from 'react';
import { Copy, Check, Terminal, Code2, Server, BookOpen, ExternalLink, X, ShieldCheck } from 'lucide-react';

interface AppsScriptCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppsScriptCodeModal: React.FC<AppsScriptCodeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'APPS_SCRIPT' | 'PYTHON_SERVER' | 'PANDUAN'>('APPS_SCRIPT');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2500);
  };

  const appsScriptCode = `/**
 * VIRTUAL OFFICE BPSDM PROVINSI JAWA TIMUR - GOOGLE APPS SCRIPT (Code.gs)
 * Standar Tata Kelola SPBE & Fleksibilitas Kerja ASN (Perpres 21/2023)
 */
const CONFIG = {
  SPREADSHEET_ID: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '',
  CHAT_WEBHOOK_URL: PropertiesService.getScriptProperties().getProperty('CHAT_WEBHOOK_URL') || '',
  CALENDAR_ID: 'primary',
  TIMEZONE: 'Asia/Jakarta',
  ROOT_FOLDER_NAME: 'BPSDM_JATIM_EVIDENCE_FWA'
};

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData ? e.postData.contents : '{}');
    const action = payload.action;
    let result = {};

    switch (action) {
      case 'SUBMIT_PRESENSI':
        result = handlePresensi(payload.data);
        break;
      case 'CREATE_DRIVE_FOLDER':
        result = handleCreateDriveFolderStructure(payload.data);
        break;
      case 'SCHEDULE_FOCUS_BLOCK':
        result = handleScheduleCalendarFocusBlock(payload.data);
        break;
      case 'SYNC_SHEET':
        result = handleSyncToSheet(payload.data);
        break;
      case 'CHAT_NOTIFICATION':
        result = handleSendChatNotification(payload.data);
        break;
      case 'SUBMIT_TASK':
        result = handleTaskLog(payload.data);
        break;
      default:
        result = { success: false, message: 'Aksi tidak dikenal: ' + action };
    }
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleCreateDriveFolderStructure(data) {
  const now = new Date();
  const tahun = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy');
  const bulan = Utilities.formatDate(now, CONFIG.TIMEZONE, 'MM_MMMM');
  const bidang = sanitize(data.bidang || 'Sekretariat');
  const nipNama = sanitize((data.nip ? data.nip + '_' : '') + (data.nama || 'ASN'));
  const tanggal = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd');

  const root = getOrCreateFolder(DriveApp.getRootFolder(), CONFIG.ROOT_FOLDER_NAME);
  const yFolder = getOrCreateFolder(root, tahun);
  const mFolder = getOrCreateFolder(yFolder, bulan);
  const bFolder = getOrCreateFolder(mFolder, bidang);
  const pFolder = getOrCreateFolder(bFolder, nipNama);
  const tFolder = getOrCreateFolder(pFolder, tanggal);

  return {
    success: true,
    folderId: tFolder.getId(),
    folderUrl: tFolder.getUrl(),
    path: CONFIG.ROOT_FOLDER_NAME + '/' + tahun + '/' + bulan + '/' + bidang + '/' + nipNama + '/' + tanggal
  };
}

function handleScheduleCalendarFocusBlock(data) {
  const cal = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
  const tgl = data.tanggal || Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const start = new Date(tgl + 'T08:00:00+07:00');
  const end = new Date(tgl + 'T16:00:00+07:00');
  const title = '[WFH BPSDM JATIM] Focus Block - ' + (data.nama || 'Pegawai');
  const desc = 'Blok Kerja Fleksibel ASN BPSDM Jatim.\\nUnit: ' + (data.bidang || 'BPSDM');
  const evt = cal.createEvent(title, start, end, { description: desc, location: 'Remote Work Kediaman' });
  return { success: true, eventId: evt.getId(), message: 'Blok fokus kerja 08.00 - 16.00 WIB dijadwalkan.' };
}

function handlePresensi(data) {
  const sheet = getOrCreateSheet('Presensi_Harian');
  const now = new Date();
  sheet.appendRow([
    'PRS-' + now.getTime(),
    Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd'),
    Utilities.formatDate(now, CONFIG.TIMEZONE, 'HH:mm:ss'),
    "'" + (data.nip || '-'),
    data.nama,
    data.unitKerja,
    data.jenisKerja || 'WFH',
    data.tipe || 'MASUK',
    data.latitude,
    data.longitude,
    data.accuracy,
    data.alamatLokasi
  ]);
  return { success: true, message: 'Presensi ' + data.tipe + ' berhasil dicatat di Sheets.' };
}

function getOrCreateFolder(parent, name) {
  const f = parent.getFoldersByName(name);
  return f.hasNext() ? f.next() : parent.createFolder(name);
}
function sanitize(s) { return s.replace(/[/\\\\?%*:|"<>]/g, '_').trim(); }
function getOrCreateSheet(name) {
  const ss = CONFIG.SPREADSHEET_ID ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}`;

  const pythonServerCode = `#!/usr/bin/env python3
"""
VIRTUAL OFFICE BPSDM PROVINSI JAWA TIMUR - SERVER PYTHON STANDALONE
Port: 3000 (0.0.0.0) | Standard Library Only (Tanpa dependencies eksternal)
"""
import http.server, socketserver, json, os, urllib.parse
from datetime import datetime

PORT = 3000

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "service": "BPSDM Jatim Python"}).encode())
            return
        # Sajikan berkas dari folder dist jika ada
        dist = os.path.join(os.getcwd(), "dist")
        if os.path.exists(dist):
            if parsed.path == "/" or not os.path.exists(os.path.join(dist, parsed.path.lstrip("/"))):
                self.path = "/dist/index.html"
            else:
                self.path = "/dist" + parsed.path
        return super().do_GET()

print(f"Server BPSDM Jatim berjalan di http://localhost:{PORT}")
with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as s:
    s.serve_forever()`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Backend Code & Panduan Implementasi</h3>
              <p className="text-xs text-slate-400">Google Apps Script (Code.gs), Python Server, & API Endpoints</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('APPS_SCRIPT')}
            className={`pb-2.5 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 ${
              activeTab === 'APPS_SCRIPT'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Google Apps Script (Code.gs)</span>
          </button>

          <button
            onClick={() => setActiveTab('PYTHON_SERVER')}
            className={`pb-2.5 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 ${
              activeTab === 'PYTHON_SERVER'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Server Python (server.py)</span>
          </button>

          <button
            onClick={() => setActiveTab('PANDUAN')}
            className={`pb-2.5 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 ${
              activeTab === 'PANDUAN'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Panduan Deployment & Running</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-700">
          {activeTab === 'APPS_SCRIPT' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-slate-800">
                  File: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-700">Code.gs</code> (Siap pasang di Google Apps Script)
                </div>
                <button
                  onClick={() => handleCopy(appsScriptCode, 'Code.gs')}
                  className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-lg shadow-xs transition"
                >
                  {copied === 'Code.gs' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === 'Code.gs' ? 'Tersalin!' : 'Salin Kode Code.gs'}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[400px]">
                <pre>{appsScriptCode}</pre>
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
                <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Format Struktur Folder Google Drive Otomatis:
                </h4>
                <code className="text-blue-800 font-mono text-[11px] block bg-blue-100/70 p-2 rounded">
                  BPSDM_JATIM_EVIDENCE_FWA / [Tahun] / [Bulan] / [Bidang] / [NIP_Nama] / [Tanggal]
                </code>
              </div>
            </div>
          )}

          {activeTab === 'PYTHON_SERVER' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-slate-800">
                  File: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700">server.py</code> (Server Python Standalone)
                </div>
                <button
                  onClick={() => handleCopy(pythonServerCode, 'server.py')}
                  className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold px-3 py-1.5 rounded-lg shadow-xs transition"
                >
                  {copied === 'server.py' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === 'server.py' ? 'Tersalin!' : 'Salin server.py'}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[400px]">
                <pre>{pythonServerCode}</pre>
              </div>

              <div className="mt-3 bg-slate-100 p-3 rounded-xl border font-mono text-[11px]">
                <div className="text-slate-500 mb-1">Perintah eksekusi di terminal:</div>
                <strong className="text-slate-900">python3 server.py</strong>
              </div>
            </div>
          )}

          {activeTab === 'PANDUAN' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <h4 className="font-bold text-emerald-900 text-sm mb-2">
                  Langkah 1: Penerapan Google Apps Script (Code.gs)
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-emerald-950">
                  <li>Buka <a href="https://script.google.com" target="_blank" rel="noreferrer" className="underline font-bold text-blue-700">script.google.com</a> dan buat Proyek Baru.</li>
                  <li>Beri nama proyek: <strong>"BPSDM Jatim Virtual Office API"</strong>.</li>
                  <li>Ganti seluruh isi <code>Code.gs</code> dengan kode dari tab <strong>Google Apps Script</strong>.</li>
                  <li>Klik <strong>Deploy &gt; New Deployment</strong>, pilih jenis <strong>Web App</strong>.</li>
                  <li>Atur:
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 text-slate-700 font-sans">
                      <li>Execute as: <strong>Me (Akun Google Anda)</strong></li>
                      <li>Who has access: <strong>Anyone</strong> (atau organisasi Pemprov Jatim)</li>
                    </ul>
                  </li>
                  <li>Salin Web App URL yang dihasilkan dan masukkan pada Command Center Google Workspace.</li>
                </ol>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-slate-900 text-sm mb-2">
                  Langkah 2: Menjalankan Server Lokal (Localhost:3000)
                </h4>
                <div className="space-y-2">
                  <p className="text-slate-600">Aplikasi ini mendukung dua mode runtime yang dapat Anda jalankan:</p>
                  
                  <div className="bg-white p-3 rounded-lg border">
                    <strong className="text-slate-800 block mb-1">Opsi A: Menggunakan Node.js & Vite (Default Full-Stack)</strong>
                    <code className="bg-slate-900 text-emerald-400 p-2 rounded block font-mono text-[11px]">
                      npm install<br />
                      npm run dev
                    </code>
                  </div>

                  <div className="bg-white p-3 rounded-lg border">
                    <strong className="text-slate-800 block mb-1">Opsi B: Menggunakan Python 3 Standalone</strong>
                    <code className="bg-slate-900 text-blue-400 p-2 rounded block font-mono text-[11px]">
                      npm run build<br />
                      python3 server.py
                    </code>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Server akan aktif melayani aplikasi frontend dan REST API pada <strong>http://localhost:3000</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
