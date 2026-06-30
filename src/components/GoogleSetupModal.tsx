import { createPortal } from "react-dom";

interface GoogleSetupModalProps {
  open: boolean;
  onClose: () => void;
}

export default function GoogleSetupModal({ open, onClose }: GoogleSetupModalProps) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#1e1e1e] p-6 shadow-2xl">
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

        <h3 className="mb-2 pr-8 text-lg font-semibold text-white">Connect Google Sign-In</h3>
        <p className="mb-4 text-sm leading-relaxed text-gray-400">
          Clicking Google opens the official Google account chooser (like CloudConvert). You need OAuth credentials.
        </p>

        <ol className="mb-4 space-y-2.5 text-sm text-gray-300">
          <li>
            <span className="font-semibold text-brand">1.</span>{" "}
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noreferrer"
              className="text-brand hover:underline"
            >
              Google Cloud Credentials
            </a>{" "}
            → Create <strong className="text-white">OAuth Client ID</strong> (Web)
          </li>
          <li>
            <span className="font-semibold text-brand">2.</span> Authorized JavaScript origin:{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">http://localhost:5173</code>
          </li>
          <li>
            <span className="font-semibold text-brand">3.</span> Authorized redirect URI:{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs break-all">
              http://localhost:5173/api/auth/google/callback
            </code>
          </li>
          <li>
            <span className="font-semibold text-brand">4.</span> Copy Client ID <strong className="text-white">and</strong> Client Secret into{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">.env</code>
          </li>
        </ol>

        <pre className="mb-4 overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-gray-300">
{`GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
APP_URL=http://localhost:5173`}
        </pre>

        <p className="text-xs text-gray-500">Restart <code className="text-gray-400">npm run dev</code> after saving.</p>
      </div>
    </div>,
    document.body
  );
}
