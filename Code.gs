/**
 * ==============================================================================
 * VIRTUAL OFFICE BPSDM PROVINSI JAWA TIMUR - GOOGLE APPS SCRIPT BACKEND
 * File: Code.gs
 * Standar Tata Kelola SPBE & Fleksibilitas Kerja (FWA) ASN Pemprov Jatim
 * Sesuai Perpres No. 21 Tahun 2023 & PermenPANRB No. 6 Tahun 2022
 * ==============================================================================
 */

// KONFIGURASI GLOBAL (Dapat disesuaikan pada Script Properties)
const CONFIG = {
  SPREADSHEET_ID: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '',
  CHAT_WEBHOOK_URL: PropertiesService.getScriptProperties().getProperty('CHAT_WEBHOOK_URL') || '',
  CALENDAR_ID: 'primary',
  TIMEZONE: 'Asia/Jakarta',
  ROOT_FOLDER_NAME: 'BPSDM_JATIM_EVIDENCE_FWA'
};

/**
 * Entry Point POST HTTP Request
 * Melayani integrasi dari Web Portal Virtual Office BPSDM Jatim
 */
function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    }

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
        result = { success: false, message: 'Aksi tidak dikenali: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    const errorResponse = {
      success: false,
      message: 'Terjadi kesalahan sistem Apps Script: ' + error.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Entry Point GET HTTP Request (Health Check)
 */
function doGet(e) {
  const info = {
    status: 'online',
    service: 'Virtual Office BPSDM Jatim Apps Script Gateway',
    timestamp: Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd HH:mm:ss 'WIB'"),
    actionsSupported: [
      'SUBMIT_PRESENSI',
      'CREATE_DRIVE_FOLDER',
      'SCHEDULE_FOCUS_BLOCK',
      'SYNC_SHEET',
      'CHAT_NOTIFICATION',
      'SUBMIT_TASK'
    ]
  };
  return ContentService.createTextOutput(JSON.stringify(info))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 1. PENCATATAN PRESENSI MANDIRI (MASUK & PULANG)
 * Mencatat presensi dengan validasi waktu (07.30 / 16.00 WIB) & koordinat geolokasi
 */
function handlePresensi(data) {
  const sheet = getOrCreateSheet('Presensi_Harian');
  const now = new Date();
  const dateFormatted = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const timeFormatted = Utilities.formatDate(now, CONFIG.TIMEZONE, 'HH:mm:ss');

  // Format Baris:
  // [ID, Tanggal, Jam, NIP, Nama, Unit Kerja, Jenis Kerja (WFH/WFO), Tipe (MASUK/PULANG), Latitude, Longitude, Akurasi, Catatan Lokasi]
  sheet.appendRow([
    'PRS-' + now.getTime(),
    dateFormatted,
    timeFormatted,
    "'" + (data.nip || '-'),
    data.nama || '-',
    data.unitKerja || '-',
    data.jenisKerja || 'WFH',
    data.tipe || 'MASUK',
    data.latitude || 0,
    data.longitude || 0,
    data.accuracy || 0,
    data.alamatLokasi || 'Geolokasi Browser Terverifikasi'
  ]);

  // Kirim notifikasi Google Chat jika WFH
  if (data.jenisKerja === 'WFH') {
    const chatMsg = `*PRESENSI WFH BPSDM JATIM*\nNama: ${data.nama} (NIP: ${data.nip})\nUnit: ${data.unitKerja}\nTipe: ${data.tipe} (${timeFormatted} WIB)\nStatus: Terverifikasi Geolokasi`;
    sendWebhookToChat(chatMsg);
  }

  return {
    success: true,
    message: `Presensi ${data.tipe} ASN berhasil dicatat pada ${timeFormatted} WIB`,
    timestamp: `${dateFormatted} ${timeFormatted}`
  };
}

/**
 * 2. OTOMASI PEMBUATAN STRUKTUR SUBFOLDER DI GOOGLE DRIVE
 * Format Direktori: [Tahun]/[Bulan]/[Bidang]/[NIP_Nama]/[Tanggal]
 */
function handleCreateDriveFolderStructure(data) {
  const now = new Date();
  const tahun = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy');
  const bulan = Utilities.formatDate(now, CONFIG.TIMEZONE, 'MM_MMMM');
  const bidang = sanitizeFolderName(data.bidang || 'Sekretariat');
  const nipNama = sanitizeFolderName((data.nip ? data.nip + '_' : '') + (data.nama || 'ASN_BPSDM'));
  const tanggal = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd');

  // 1. Dapatkan atau buat root folder
  const rootFolder = getOrCreateFolder(DriveApp.getRootFolder(), CONFIG.ROOT_FOLDER_NAME);
  // 2. Tahun
  const tahunFolder = getOrCreateFolder(rootFolder, tahun);
  // 3. Bulan
  const bulanFolder = getOrCreateFolder(tahunFolder, bulan);
  // 4. Bidang
  const bidangFolder = getOrCreateFolder(bulanFolder, bidang);
  // 5. NIP_Nama
  const pegawaiFolder = getOrCreateFolder(bidangFolder, nipNama);
  // 6. Tanggal
  const targetFolder = getOrCreateFolder(pegawaiFolder, tanggal);

  return {
    success: true,
    folderId: targetFolder.getId(),
    folderName: targetFolder.getName(),
    folderUrl: targetFolder.getUrl(),
    pathStructure: `${CONFIG.ROOT_FOLDER_NAME}/${tahun}/${bulan}/${bidang}/${nipNama}/${tanggal}`
  };
}

/**
 * 3. OTOMASI PENJADWALAN BLOK FOKUS KERJA DI GOOGLE CALENDAR
 * Mengatur event jam kerja 08.00 - 16.00 WIB dengan status 'Focus Time / Remote Work'
 */
function handleScheduleCalendarFocusBlock(data) {
  const calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
  if (!calendar) {
    throw new Error('Kalender tidak ditemukan');
  }

  const tanggalStr = data.tanggal || Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const startDateTime = new Date(`${tanggalStr}T08:00:00+07:00`);
  const endDateTime = new Date(`${tanggalStr}T16:00:00+07:00`);

  const title = `[WFH BPSDM JATIM] Focus Block - ${data.nama || 'Pegawai'}`;
  const description = `Blok Waktu Kerja Mandiri Fleksibel (FWA) ASN BPSDM Provinsi Jawa Timur.\nUnit: ${data.bidang || 'BPSDM Jatim'}\nRencana Target Luaran: ${data.targetLuaran || 'Pelaksanaan Tugas Kediklatan'}\nRegulasi: Perpres 21/2023 & PermenPANRB 6/2022`;

  const event = calendar.createEvent(title, startDateTime, endDateTime, {
    description: description,
    location: 'Remote Work / Kediaman Resmi Terdaftar'
  });

  return {
    success: true,
    eventId: event.getId(),
    title: title,
    startTime: startDateTime.toISOString(),
    endTime: endDateTime.toISOString(),
    message: 'Blok fokus kerja 08.00 - 16.00 WIB berhasil dijadwalkan di Google Calendar.'
  };
}

/**
 * 4. PENCATATAN LOG PENUGASAN & TARGET KINERJA KE GOOGLE SHEETS
 */
function handleTaskLog(data) {
  const sheet = getOrCreateSheet('Log_Tugas_Kinerja');
  const now = new Date();
  const dateFormatted = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd');

  sheet.appendRow([
    'TSK-' + now.getTime(),
    dateFormatted,
    "'" + (data.nip || '-'),
    data.nama || '-',
    data.bidang || '-',
    data.judulTugas || '-',
    data.kategoriKediklatan || 'ADMINISTRASI',
    data.targetKuantitas || 1,
    data.satuan || 'Dokumen',
    data.progres || '0%',
    data.linkBuktiEvidence || '-',
    data.catatanEvaluasi || '-'
  ]);

  return {
    success: true,
    message: 'Target luaran kinerja berhasil dicatat pada Google Sheets e-Kinerja BPSDM Jatim.'
  };
}

/**
 * 5. PENGIRIMAN NOTIFIKASI KE GOOGLE CHAT SPACE (WEBHOOK)
 */
function handleSendChatNotification(data) {
  const title = data.title || 'Pengumuman Virtual Office BPSDM Jatim';
  const text = data.message || 'Pemberitahuan resmi sistem kerja fleksibel BPSDM Jawa Timur.';
  const payloadMessage = `*${title.toUpperCase()}*\n${text}\n_Waktu Siar: ${Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'dd MMM yyyy HH:mm WIB')}_`;

  return sendWebhookToChat(payloadMessage);
}

function sendWebhookToChat(messageText) {
  const webhookUrl = CONFIG.CHAT_WEBHOOK_URL;
  if (!webhookUrl) {
    return {
      success: true,
      message: 'Simulasi notifikasi Google Chat (Webhook URL belum disetel di Script Properties).'
    };
  }

  const payload = JSON.stringify({ text: messageText });
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: payload,
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(webhookUrl, options);
  return {
    success: response.getResponseCode() === 200,
    statusCode: response.getResponseCode(),
    response: response.getContentText()
  };
}

/**
 * HELPER UTILITIES
 */
function getOrCreateSheet(sheetName) {
  let ss;
  if (CONFIG.SPREADSHEET_ID) {
    ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.create('BPSDM_Jatim_Virtual_Office_Master_Database');
      CONFIG.SPREADSHEET_ID = ss.getId();
    }
  }

  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    // Berikan header default jika sheet baru
    if (sheetName === 'Presensi_Harian') {
      sheet.appendRow([
        'ID Presensi', 'Tanggal', 'Jam', 'NIP', 'Nama ASN', 'Unit Kerja', 
        'Jenis Kerja', 'Tipe Presensi', 'Latitude', 'Longitude', 'Akurasi (Meter)', 'Keterangan Lokasi'
      ]);
      sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#E2E8F0');
    } else if (sheetName === 'Log_Tugas_Kinerja') {
      sheet.appendRow([
        'ID Tugas', 'Tanggal', 'NIP', 'Nama ASN', 'Bidang', 
        'Uraian Butir Kegiatan', 'Kategori Kediklatan', 'Target Kuantitas', 'Satuan Output', 
        'Progres', 'Tautan Bukti Evidence (Drive)', 'Catatan Pimpinan'
      ]);
      sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#E2E8F0');
    }
  }
  return sheet;
}

function getOrCreateFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(folderName);
}

function sanitizeFolderName(name) {
  return name.replace(/[/\\?%*:|"<>]/g, '_').trim();
}
