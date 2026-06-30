import { useEffect, useState } from "react";

/** Starting totals — tick upward for live “and counting” effect. */
const BASE_FILES = 3_083_354_585;
const BASE_DATA_PB = 23;
const TRUSTED_SINCE = 2024;

function formatFiles(n: number) {
  return n.toLocaleString("en-US");
}

export default function FilesCounter() {
  const [files, setFiles] = useState(BASE_FILES);
  const [dataPb, setDataPb] = useState(BASE_DATA_PB);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFiles((prev) => prev + Math.floor(Math.random() * 48) + 8);
      if (Math.random() < 0.018) {
        setDataPb((prev) => prev + 1);
      }
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      className="w-full border-t border-white/[0.06] bg-[#1a1a1a] px-4 py-14 text-center sm:py-16"
      aria-label="Conversion statistics"
    >
      <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.28em] text-gray-500">
        Trusted since {TRUSTED_SINCE}
      </p>
      <p className="mx-auto max-w-4xl text-base leading-relaxed text-gray-400 sm:text-lg md:text-xl">
        <span className="font-bold tabular-nums text-white">{formatFiles(files)}</span>
        {" files converted — "}
        <span className="font-bold tabular-nums text-white">{dataPb} PB</span>
        {" of data processed — and counting."}
      </p>
    </section>
  );
}
