#!/usr/bin/env python3
"""
==============================================================================
VIRTUAL OFFICE BPSDM PROVINSI JAWA TIMUR - LOCAL SERVER (PYTHON 3)
File: server.py
Port: 3000 (0.0.0.0)
Standar SPBE & Fleksibilitas Kerja (FWA) ASN Pemprov Jawa Timur
==============================================================================
"""

import http.server
import socketserver
import json
import os
import urllib.parse
from datetime import datetime

PORT = 3000
HOST = "0.0.0.0"

# In-Memory Database dengan Data Awal Realistis
DB = {
    "presensi": [
        {
            "id": "PRS-001",
            "nip": "197805122005011003",
            "nama": "Bambang Sudarsono, S.Kom., M.T.",
            "unitKerja": "Sekretariat",
            "jenisKerja": "WFH",
            "tipe": "MASUK",
            "jam": "07:28:15 WIB",
            "tanggal": datetime.now().strftime("%Y-%m-%d"),
            "latitude": -7.2612,
            "longitude": 112.6789,
            "accuracy": 12.5,
            "alamat": "Kediaman Terdaftar (Surabaya Barat)"
        },
        {
            "id": "PRS-002",
            "nip": "198203142008012015",
            "nama": "Dyah Retno Palupi, S.IP., M.PSDM.",
            "unitKerja": "Bidang PK Manajerial",
            "jenisKerja": "WFH",
            "tipe": "MASUK",
            "jam": "07:22:40 WIB",
            "tanggal": datetime.now().strftime("%Y-%m-%d"),
            "latitude": -7.2891,
            "longitude": 112.7344,
            "accuracy": 9.8,
            "alamat": "Kediaman Terdaftar (Surabaya Selatan)"
        }
    ],
    "tasks": [
        {
            "id": "TSK-001",
            "nip": "197805122005011003",
            "nama": "Bambang Sudarsono, S.Kom., M.T.",
            "bidang": "Sekretariat",
            "judulTugas": "Verifikasi kelengkapan berkas administrasi dan usulan WFH 12 pegawai sub-bidang",
            "kategori": "ADMINISTRASI_PESERTA",
            "targetKuantitas": 12,
            "satuan": "Dokumen ASN",
            "progres": 100,
            "evidenceUrl": "https://drive.google.com/drive/folders/bpsdm-shared-evidence",
            "status": "SELESAI",
            "tanggal": datetime.now().strftime("%Y-%m-%d")
        },
        {
            "id": "TSK-002",
            "nip": "197805122005011003",
            "nama": "Bambang Sudarsono, S.Kom., M.T.",
            "bidang": "Sekretariat",
            "judulTugas": "Penyusunan rekapitulasi kepatuhan kuota maksimal 50% WFH sesuai Perpres 21/2023",
            "kategori": "ADMINISTRASI_PESERTA",
            "targetKuantitas": 1,
            "satuan": "Laporan Rekap",
            "progres": 50,
            "evidenceUrl": "https://docs.google.com/spreadsheets/d/bpsdm-rekap-wfh",
            "status": "PROSES",
            "tanggal": datetime.now().strftime("%Y-%m-%d")
        },
        {
            "id": "TSK-003",
            "nip": "197109201997031004",
            "nama": "Dr. Agus Wibowo, S.H., M.Si. (Widyaiswara Ahli Utama)",
            "bidang": "Bidang PK Manajerial",
            "judulTugas": "Review modul pelatihan blended learning PKA Agenda III: Manajemen Kinerja Publik",
            "kategori": "KURIKULUM_MODUL",
            "targetKuantitas": 1,
            "satuan": "Modul Ajar",
            "progres": 100,
            "evidenceUrl": "https://drive.google.com/drive/folders/bpsdm-pka-modul",
            "status": "SELESAI",
            "tanggal": datetime.now().strftime("%Y-%m-%d")
        },
        {
            "id": "TSK-004",
            "nip": "197109201997031004",
            "nama": "Dr. Agus Wibowo, S.H., M.Si. (Widyaiswara Ahli Utama)",
            "bidang": "Bidang PK Manajerial",
            "judulTugas": "Penyusunan 40 butir bank soal post-test evaluasi pemahaman regulasi SPBE",
            "kategori": "LMS_SI_PRAJA",
            "targetKuantitas": 40,
            "satuan": "Butir Soal",
            "progres": 50,
            "evidenceUrl": "https://sipraja.jatimprov.go.id/bank-soal/evaluasi",
            "status": "PROSES",
            "tanggal": datetime.now().strftime("%Y-%m-%d")
        }
    ],
    "units": [
        {
            "id": "sekretariat",
            "nama": "Sekretariat",
            "totalPegawai": 24,
            "wfhCount": 11,
            "wfoCount": 13,
            "persenWfh": 45.8,
            "statusKuota": "AMAN_DIBAWAH_50"
        },
        {
            "id": "pk_manajerial",
            "nama": "Bidang PK Manajerial",
            "totalPegawai": 20,
            "wfhCount": 10,
            "wfoCount": 10,
            "persenWfh": 50.0,
            "statusKuota": "BATAS_MAKSIMAL_50"
        },
        {
            "id": "pk_fungsional_soskul",
            "nama": "Bidang PK Fungsional & Sosial Kultural",
            "totalPegawai": 18,
            "wfhCount": 7,
            "wfoCount": 11,
            "persenWfh": 38.9,
            "statusKuota": "AMAN_DIBAWAH_50"
        },
        {
            "id": "sertifikasi_penjaminan_mutu",
            "nama": "Bidang Sertifikasi Kompetensi & Penjaminan Mutu",
            "totalPegawai": 16,
            "wfhCount": 6,
            "wfoCount": 10,
            "persenWfh": 37.5,
            "statusKuota": "AMAN_DIBAWAH_50"
        }
    ]
}


class VirtualOfficeHandler(http.server.SimpleHTTPRequestHandler):
    """Handler HTTP untuk static files dan REST API Virtual Office BPSDM Jatim"""

    def _set_json_headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_json_headers(204)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # 1. API Health Check
        if path == "/api/health":
            self._set_json_headers(200)
            self.wfile.write(json.dumps({
                "status": "ok",
                "service": "Virtual Office BPSDM Jatim Python Core",
                "timestamp": datetime.now().isoformat(),
                "port": PORT
            }).encode("utf-8"))
            return

        # 2. API Presensi
        if path == "/api/presensi":
            self._set_json_headers(200)
            self.wfile.write(json.dumps(DB["presensi"]).encode("utf-8"))
            return

        # 3. API Tasks (Papan Penugasan)
        if path == "/api/tasks":
            self._set_json_headers(200)
            self.wfile.write(json.dumps(DB["tasks"]).encode("utf-8"))
            return

        # 4. API Executive Summary (Dasbor Kepala BPSDM)
        if path in ("/api/executive-summary", "/api/stats"):
            total_asn = sum(u["totalPegawai"] for u in DB["units"])
            total_wfh = sum(u["wfhCount"] for u in DB["units"])
            total_wfo = sum(u["wfoCount"] for u in DB["units"])
            overall_persen = round((total_wfh / total_asn) * 100, 1) if total_asn > 0 else 0

            response_data = {
                "tanggal": datetime.now().strftime("%Y-%m-%d"),
                "totalAsn": total_asn,
                "totalWfh": total_wfh,
                "totalWfo": total_wfo,
                "overallWfhPercentage": overall_persen,
                "complianceStatus": "PATUH_PERPRES_21_2023" if overall_persen <= 50.0 else "PERINGATAN_MELEBIHI_50",
                "quotas": DB["units"],
                "totalTasks": len(DB["tasks"]),
                "completedTasks": sum(1 for t in DB["tasks"] if t["progres"] == 100),
                "jamKedinasan": {
                    "jamMasuk": "07:30 WIB",
                    "jamPulang": "16:00 WIB",
                    "statusWaktu": "JAM_DINAS_AKTIF"
                }
            }
            self._set_json_headers(200)
            self.wfile.write(json.dumps(response_data).encode("utf-8"))
            return

        # 5. Static File Serving (dist/ or root)
        dist_dir = os.path.join(os.getcwd(), "dist")
        if os.path.exists(dist_dir) and os.path.isdir(dist_dir):
            # Jika request root path, sajikan dist/index.html
            if path == "/" or not os.path.exists(os.path.join(dist_dir, path.lstrip("/"))):
                self.path = "/dist/index.html"
            else:
                self.path = "/dist" + path

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8")
        payload = json.loads(body) if body else {}

        # 1. Presensi Mandiri (Masuk / Pulang)
        if path == "/api/presensi":
            new_presensi = {
                "id": f"PRS-{len(DB['presensi']) + 1:03d}",
                "nip": payload.get("nip", "-"),
                "nama": payload.get("nama", "-"),
                "unitKerja": payload.get("unitKerja", "Sekretariat"),
                "jenisKerja": payload.get("jenisKerja", "WFH"),
                "tipe": payload.get("tipe", "MASUK"),
                "jam": datetime.now().strftime("%H:%M:%S WIB"),
                "tanggal": datetime.now().strftime("%Y-%m-%d"),
                "latitude": payload.get("latitude", -7.2612),
                "longitude": payload.get("longitude", 112.6789),
                "accuracy": payload.get("accuracy", 10.0),
                "alamat": payload.get("alamat", "Geolokasi Valid Terverifikasi")
            }
            DB["presensi"].insert(0, new_presensi)
            self._set_json_headers(201)
            self.wfile.write(json.dumps({
                "success": True,
                "message": f"Presensi {new_presensi['tipe']} ASN berhasil dicatat.",
                "data": new_presensi
            }).encode("utf-8"))
            return

        # 2. Tambah / Update Task Kinerja Harian
        if path == "/api/tasks":
            task_id = payload.get("id")
            # Jika update progres
            if task_id:
                for t in DB["tasks"]:
                    if t["id"] == task_id:
                        t["progres"] = int(payload.get("progres", t["progres"]))
                        t["status"] = "SELESAI" if t["progres"] == 100 else ("PROSES" if t["progres"] > 0 else "BELUM_MULAI")
                        if payload.get("evidenceUrl"):
                            t["evidenceUrl"] = payload["evidenceUrl"]
                        self._set_json_headers(200)
                        self.wfile.write(json.dumps({"success": True, "data": t}).encode("utf-8"))
                        return

            # Tambah task baru
            new_task = {
                "id": f"TSK-{len(DB['tasks']) + 1:03d}",
                "nip": payload.get("nip", "-"),
                "nama": payload.get("nama", "-"),
                "bidang": payload.get("bidang", "Sekretariat"),
                "judulTugas": payload.get("judulTugas", "Uraian tugas kediklatan"),
                "kategori": payload.get("kategori", "ADMINISTRASI_PESERTA"),
                "targetKuantitas": int(payload.get("targetKuantitas", 1)),
                "satuan": payload.get("satuan", "Dokumen"),
                "progres": int(payload.get("progres", 0)),
                "evidenceUrl": payload.get("evidenceUrl", "-"),
                "status": "SELESAI" if int(payload.get("progres", 0)) == 100 else "PROSES",
                "tanggal": datetime.now().strftime("%Y-%m-%d")
            }
            DB["tasks"].insert(0, new_task)
            self._set_json_headers(201)
            self.wfile.write(json.dumps({
                "success": True,
                "message": "Target luaran kinerja berhasil ditambahkan.",
                "data": new_task
            }).encode("utf-8"))
            return

        self._set_json_headers(404)
        self.wfile.write(json.dumps({"error": "Endpoint tidak ditemukan"}).encode("utf-8"))


def run():
    print("=" * 70)
    print(f"🚀 VIRTUAL OFFICE BPSDM JATIM SERVER (PYTHON 3)")
    print(f"📡 Mendengarkan di: http://localhost:{PORT}")
    print(f"🏛️  Sistem Kerja Fleksibel ASN - Perpres No. 21/2023 & PermenPANRB No. 6/2022")
    print("=" * 70)
    with socketserver.TCPServer((HOST, PORT), VirtualOfficeHandler) as httpd:
        httpd.allow_reuse_address = True
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer dihentikan.")


if __name__ == "__main__":
    run()
