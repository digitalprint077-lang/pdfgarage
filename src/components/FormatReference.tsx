interface FormatReferenceProps {
  darkMode: boolean;
}

export default function FormatReference({ darkMode }: FormatReferenceProps) {
  return (
    <section className="mb-12">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand">
        Format reference
      </p>
      <div
        className={`rounded-2xl border p-6 ${
          darkMode ? "border-surface-border bg-surface-raised/50" : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-500/20">
            <svg className="h-7 w-7 text-red-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 12h8v2H8v-2zm0 4h5v2H8v-2z" />
            </svg>
          </div>
          <div>
            <h3 className="mb-1 text-lg font-semibold">PDF</h3>
            <p className="text-xs text-gray-500">Portable Document Format</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              PDF is a document file format that contains text, images, and data. It is
              operating-system independent, an open standard that compresses documents and
              vector graphics, and can be viewed in any modern web browser.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
