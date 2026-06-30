import { POPULAR_CONVERSIONS } from "../data/catalog";
import { useI18n } from "../i18n/I18nContext";

export default function PopularConversions({
  onSelect,
  darkMode,
}: {
  onSelect: (from: string, to: string) => void;
  darkMode: boolean;
}) {
  const { t } = useI18n();
  return (
    <section className="mb-12">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand">
        {t("popularConversions")}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {POPULAR_CONVERSIONS.map((c) => (
          <button
            key={`${c.from}-${c.to}`}
            onClick={() => onSelect(c.from, c.to)}
            className={`rounded-xl border p-4 text-left transition hover:border-brand/40 ${
              darkMode
                ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                : "border-gray-200 bg-white hover:shadow-md"
            }`}
          >
            <span className="font-semibold uppercase">
              {c.from} → {c.to}
            </span>
            <p className="mt-1 text-sm text-gray-400">{c.tag}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
