import { createPortal } from "react-dom";
import type { CloudProvider } from "./AddFilesMenu";

const PROVIDER_LABELS: Record<CloudProvider, string> = {
  "google-drive": "Google Drive",
  dropbox: "Dropbox",
  onedrive: "OneDrive",
};

const SETUP_HINTS: Record<CloudProvider, string> = {
  "google-drive": "Add VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY to .env (see .env.example), then restart the dev server.",
  dropbox: "Add VITE_DROPBOX_APP_KEY to .env (see .env.example), then restart the dev server.",
  onedrive: "Add VITE_ONEDRIVE_CLIENT_ID to .env (see .env.example), then restart the dev server.",
};

interface CloudSetupModalProps {
  provider: CloudProvider | null;
  onClose: () => void;
  onUseComputer: () => void;
  onUseUrl: () => void;
}

export default function CloudSetupModal({ provider, onClose, onUseComputer, onUseUrl }: CloudSetupModalProps) {
  if (!provider) return null;

  const label = PROVIDER_LABELS[provider];

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#1e1e1e] p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded p-1 text-gray-500 hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="mb-2 pr-8 text-lg font-semibold text-white">{label} not connected</h3>
        <p className="mb-6 text-sm leading-relaxed text-gray-400">
          Choose another way to upload your file, or ask your administrator to connect {label}.
        </p>

        <div className="mb-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => { onUseComputer(); onClose(); }}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white transition hover:bg-white/10"
          >
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            From my computer
          </button>
          <button
            type="button"
            onClick={() => { onUseUrl(); onClose(); }}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white transition hover:bg-white/10"
          >
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            By URL
          </button>
        </div>

        <details className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-gray-500">
          <summary className="cursor-pointer font-medium text-gray-400">Administrator setup</summary>
          <p className="mt-2 leading-relaxed">{SETUP_HINTS[provider]}</p>
        </details>
      </div>
    </div>,
    document.body
  );
}
