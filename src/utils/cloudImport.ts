import type { CloudProvider } from "../components/AddFilesMenu";

const CLOUD_LABELS: Record<CloudProvider, string> = {
  "google-drive": "Google Drive",
  dropbox: "Dropbox",
  onedrive: "OneDrive",
};

export function isCloudConfigured(provider: CloudProvider): boolean {
  if (provider === "google-drive") {
    return !!(import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_API_KEY);
  }
  if (provider === "dropbox") {
    return !!import.meta.env.VITE_DROPBOX_APP_KEY;
  }
  return !!import.meta.env.VITE_ONEDRIVE_CLIENT_ID;
}

export function getCloudUnavailableMessage(provider: CloudProvider): string {
  return `${CLOUD_LABELS[provider]} is not connected yet. Please use "From my computer" or "By URL" to upload your file.`;
}

/** Attempt cloud import; throws if not configured or import fails. */
export async function importFromCloud(provider: CloudProvider): Promise<File | null> {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined;
  const dropboxKey = import.meta.env.VITE_DROPBOX_APP_KEY as string | undefined;

  if (provider === "google-drive" && googleClientId && googleApiKey) {
    return pickFromGoogleDrive(googleClientId, googleApiKey);
  }
  if (provider === "dropbox" && dropboxKey) {
    return pickFromDropbox(dropboxKey);
  }

  throw new Error(getCloudUnavailableMessage(provider));
}

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.id = id;
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

async function pickFromGoogleDrive(clientId: string, apiKey: string): Promise<File | null> {
  await loadScript("https://apis.google.com/js/api.js", "google-api");
  await loadScript("https://accounts.google.com/gsi/client", "google-gsi");

  const win = window as Window & {
    gapi?: { load: (n: string, cb: () => void) => void; client?: { init: (o: object) => Promise<void> } };
    google?: {
      accounts?: { oauth2?: { initTokenClient: (c: object) => { requestAccessToken: () => void } } };
      picker?: {
        DocsView: new () => { setIncludeFolders: (v: boolean) => unknown };
        PickerBuilder: new () => {
          addView: (v: unknown) => unknown;
          setOAuthToken: (t: string) => unknown;
          setDeveloperKey: (k: string) => unknown;
          setCallback: (cb: (d: { docs?: { id: string; name: string; mimeType: string }[] }) => void) => unknown;
          build: () => { setVisible: (v: boolean) => void };
        };
      };
    };
  };

  if (!win.gapi?.client) throw new Error("Google API failed to load");
  await new Promise<void>((r) => win.gapi!.load("client:picker", r));
  await win.gapi.client!.init({
    apiKey,
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
  });

  const token = await new Promise<string>((resolve, reject) => {
    const client = win.google!.accounts!.oauth2!.initTokenClient({
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/drive.readonly",
      callback: (resp: { access_token?: string; error?: string }) => {
        if (resp.access_token) resolve(resp.access_token);
        else reject(new Error(resp.error || "Google auth failed"));
      },
    });
    client.requestAccessToken();
  });

  const doc = await new Promise<{ id: string; name: string; mimeType: string } | null>((resolve) => {
    const view = new win.google!.picker!.DocsView().setIncludeFolders(false);
    new win.google!.picker!.PickerBuilder()
      .addView(view)
      .setOAuthToken(token)
      .setDeveloperKey(apiKey)
      .setCallback((data) => resolve(data.docs?.[0] ?? null))
      .build()
      .setVisible(true);
  });

  if (!doc) return null;

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to download from Google Drive");
  const blob = await res.blob();
  return new File([blob], doc.name, { type: doc.mimeType || blob.type });
}

async function pickFromDropbox(appKey: string): Promise<File | null> {
  await loadScript("https://www.dropbox.com/static/api/2/dropins.js", "dropboxjs");
  (window as Window & { Dropbox?: { appKey: string } }).Dropbox = { appKey };

  return new Promise((resolve, reject) => {
    const Dropbox = (window as Window & {
      Dropbox?: {
        choose: (o: {
          success: (files: { link: string; name: string }[]) => void;
          cancel: () => void;
          linkType: string;
          multiselect: boolean;
        }) => void;
      };
    }).Dropbox;
    if (!Dropbox?.choose) {
      reject(new Error("Dropbox Chooser failed to load"));
      return;
    }
    Dropbox.choose({
      success: async (files) => {
        try {
          const f = files[0];
          if (!f) {
            resolve(null);
            return;
          }
          const res = await fetch(f.link);
          const blob = await res.blob();
          resolve(new File([blob], f.name, { type: blob.type }));
        } catch (e) {
          reject(e);
        }
      },
      cancel: () => resolve(null),
      linkType: "direct",
      multiselect: false,
    });
  });
}
