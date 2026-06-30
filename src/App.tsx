import { useCallback, useEffect, useState } from "react";
import Header from "./components/Header";
import ConverterHero from "./components/ConverterHero";
import UploadZone from "./components/UploadZone";
import CategoryBrowser from "./components/CategoryBrowser";
import SecuritySection from "./components/SecuritySection";
import FilesCounter from "./components/FilesCounter";
import Footer from "./components/Footer";
import { useI18n } from "./i18n/I18nContext";
import { pickRandomConversionPair } from "./data/formats";
import {
  TOOLS,
  type ToolDef,
  type FormatCategory,
  type Operation,
  inferFormatFromFile,
} from "./data/catalog";

export type ConversionState = "idle" | "uploading" | "converting" | "done" | "error";

interface AppProps {
  tool?: ToolDef;
}

const HOME_FORMAT_ROTATE_MS = 3800;

export default function App({ tool }: AppProps) {
  const { t } = useI18n();
  const activeTool = tool || TOOLS[0];
  const isHome = activeTool.id === "home";
  const [fromFormat, setFromFormat] = useState(activeTool.defaultFrom || "pdf");
  const [toFormat, setToFormat] = useState(activeTool.defaultTo || "any");
  const [operation, setOperation] = useState<Operation>(activeTool.operation);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ConversionState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<FormatCategory>(activeTool.category || "document");
  const [formatAutoRotate, setFormatAutoRotate] = useState(isHome);
  const [formatPickerOpen, setFormatPickerOpen] = useState(false);

  useEffect(() => {
    setFromFormat(activeTool.defaultFrom || "pdf");
    setToFormat(activeTool.defaultTo || "any");
    setOperation(activeTool.operation);
    if (activeTool.category) setActiveCategory(activeTool.category);
    setSelectedFiles([]);
    setStatus("idle");
    setError(null);
    setFormatAutoRotate(activeTool.id === "home");
  }, [activeTool.id]);

  useEffect(() => {
    if (!isHome || selectedFiles.length > 0 || !formatAutoRotate || formatPickerOpen) return;

    const rotate = () => {
      const pair = pickRandomConversionPair();
      setFromFormat(pair.from);
      setToFormat(pair.to);
    };

    const initial = window.setTimeout(rotate, 2200);
    const interval = window.setInterval(rotate, HOME_FORMAT_ROTATE_MS);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [isHome, selectedFiles.length, formatAutoRotate, formatPickerOpen]);

  const pauseFormatAutoRotate = useCallback(() => {
    setFormatAutoRotate(false);
  }, []);

  const handleFromFormatChange = useCallback(
    (f: string) => {
      pauseFormatAutoRotate();
      setFromFormat(f);
    },
    [pauseFormatAutoRotate]
  );

  const handleToFormatChange = useCallback(
    (f: string) => {
      pauseFormatAutoRotate();
      setToFormat(f);
    },
    [pauseFormatAutoRotate]
  );

  const handleFormatLink = useCallback((from: string, to: string) => {
    pauseFormatAutoRotate();
    setFromFormat(from);
    setToFormat(to);
    setOperation("convert");
    setSelectedFiles([]);
    setStatus("idle");
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pauseFormatAutoRotate]);

  const handleFilesSelect = useCallback(
    (files: File[]) => {
      setSelectedFiles(files);
      if (files.length > 0 && operation === "convert") {
        const inferred = inferFormatFromFile(files[0]);
        setFromFormat(inferred);
        if (toFormat !== "any" && toFormat === inferred) {
          setToFormat("any");
        }
      }
      if (files.length === 0) {
        setStatus("idle");
        setError(null);
      }
    },
    [operation, toFormat]
  );

  const title = activeTool.id === "home" ? t("homeTitle") : activeTool.label;
  const subtitle =
    activeTool.id === "home"
      ? t("homeSubtitle")
      : activeTool.description || `Use the ${activeTool.label} to transform your files online.`;

  return (
    <div className="page-shell flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-10">
        <ConverterHero
          title={title}
          subtitle={subtitle}
          fromFormat={fromFormat}
          toFormat={toFormat}
          operation={operation}
          onFromChange={handleFromFormatChange}
          onToChange={handleToFormatChange}
          onOperationChange={setOperation}
          hideFormatPickers={operation !== "convert"}
          hasFiles={selectedFiles.length > 0}
          onPickerOpenChange={setFormatPickerOpen}
          onFormatInteraction={pauseFormatAutoRotate}
        />
        <UploadZone
          operation={operation}
          fromFormat={fromFormat}
          toFormat={toFormat}
          selectedFiles={selectedFiles}
          onFilesSelect={handleFilesSelect}
          status={status}
          error={error}
          onStatusChange={setStatus}
          onError={setError}
          onToFormatChange={handleToFormatChange}
        />
        {activeTool.id === "home" ? (
          <>
            <CategoryBrowser
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              onFormatSelect={(f) => handleFormatLink(f, "any")}
              onConversionSelect={handleFormatLink}
            />
            <SecuritySection />
          </>
        ) : null}
      </main>

      {activeTool.id === "home" ? <FilesCounter /> : null}

      <Footer />
    </div>
  );
}
