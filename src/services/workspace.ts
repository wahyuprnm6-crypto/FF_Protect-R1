import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let app: any = null;
let auth: any = null;
try {
  if (firebaseConfig && (firebaseConfig as any).apiKey) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
  }
} catch (e) {
  console.warn('Firebase init warning (running in standalone/mock mode):', e);
}

export const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;
try {
  cachedAccessToken = localStorage.getItem('bpsdm_google_access_token');
} catch {}

export const initAuth = (
  onAuthSuccess?: (user: User | any, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Cek apakah ada sesi SSO lokal tersimpan
  let savedUserJson: string | null = null;
  try {
    savedUserJson = localStorage.getItem('bpsdm_sso_user');
  } catch {}

  if (savedUserJson && cachedAccessToken) {
    try {
      const savedUser = JSON.parse(savedUserJson);
      if (onAuthSuccess) {
        onAuthSuccess(savedUser, cachedAccessToken);
      }
    } catch {}
  }

  if (!auth) {
    return () => {};
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const token = cachedAccessToken || 'sso-google-token-active';
      try {
        localStorage.setItem(
          'bpsdm_sso_user',
          JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          })
        );
      } catch {}
      if (onAuthSuccess) onAuthSuccess(user, token);
    } else if (!savedUserJson) {
      cachedAccessToken = null;
      try {
        localStorage.removeItem('bpsdm_google_access_token');
        localStorage.removeItem('bpsdm_sso_user');
      } catch {}
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User | any; accessToken: string } | null> => {
  if (!auth) {
    return simulateSsoSignIn('wahyuprnm6@gmail.com', 'Wahyu Purnomo, S.Kom', 'https://ui-avatars.com/api/?name=Wahyu+Purnomo&background=0D9488&color=fff');
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || `google-sso-token-${Date.now()}`;

    cachedAccessToken = token;
    try {
      localStorage.setItem('bpsdm_google_access_token', token);
      localStorage.setItem(
        'bpsdm_sso_user',
        JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        })
      );
    } catch {}
    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.warn('Sign in popup caught error:', error);
    // Jika popup diblokir oleh iFrame atau error koneksi, lempar error agar UI dapat menampilkan fallback SSO modal
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const simulateSsoSignIn = (email: string, displayName: string, photoURL?: string) => {
  const token = `sso-token-${Date.now()}`;
  const mockUser = {
    uid: `sso-${Date.now()}`,
    email,
    displayName,
    photoURL: photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D9488&color=fff`,
  };
  cachedAccessToken = token;
  localStorage.setItem('bpsdm_google_access_token', token);
  localStorage.setItem('bpsdm_sso_user', JSON.stringify(mockUser));
  return { user: mockUser, accessToken: token };
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  try {
    await auth.signOut();
  } catch {}
  cachedAccessToken = null;
  localStorage.removeItem('bpsdm_google_access_token');
  localStorage.removeItem('bpsdm_sso_user');
};

// ==========================================
// GOOGLE WORKSPACE NATIVE API IMPLEMENTATIONS
// ==========================================

export interface CalendarEventPayload {
  summary: string;
  description: string;
  startDateTime: string; // ISO format
  endDateTime: string;   // ISO format
  attendees?: { email: string }[];
  withMeetLink?: boolean;
}

/**
 * 1. Google Calendar API + Google Meet Link Generator
 */
export async function createCalendarMeetEvent(
  token: string, 
  payload: CalendarEventPayload
): Promise<{ id: string; htmlLink: string; meetLink?: string }> {
  const body: any = {
    summary: payload.summary,
    description: payload.description,
    start: {
      dateTime: payload.startDateTime,
      timeZone: 'Asia/Jakarta',
    },
    end: {
      dateTime: payload.endDateTime,
      timeZone: 'Asia/Jakarta',
    },
    attendees: payload.attendees || [],
  };

  if (payload.withMeetLink) {
    body.conferenceData = {
      createRequest: {
        requestId: `bpsdm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    };
  }

  const endpoint = `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal membuat agenda Google Calendar (${response.status})`);
  }

  const result = await response.json();
  const meetLink = result.hangoutLink || result.conferenceData?.entryPoints?.[0]?.uri || undefined;

  return {
    id: result.id,
    htmlLink: result.htmlLink,
    meetLink,
  };
}

/**
 * 2. Google Drive API - Shared Folders & File Registration
 */
export async function createDriveFolder(
  token: string, 
  folderName: string
): Promise<{ id: string; webViewLink: string }> {
  const metadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    description: 'Folder Resmi Kediklatan & Evaluasi BPSDM Provinsi Jawa Timur',
  };

  const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal membuat folder Google Drive (${response.status})`);
  }

  return await response.json();
}

/**
 * 3. Google Sheets API - Ekspor Rekapitulasi Presensi FWA & Capaian SKP
 */
export async function exportFwaToGoogleSheets(
  token: string,
  title: string,
  rowsData: string[][]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  // Step A: Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal membuat Google Spreadsheet (${createRes.status})`);
  }

  const sheetInfo = await createRes.json();
  const spreadsheetId = sheetInfo.spreadsheetId;

  // Step B: Write values
  const range = 'Sheet1!A1';
  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: rowsData,
      }),
    }
  );

  if (!appendRes.ok) {
    const err = await appendRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal mengisi data Google Spreadsheet (${appendRes.status})`);
  }

  return {
    spreadsheetId,
    spreadsheetUrl: sheetInfo.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}
