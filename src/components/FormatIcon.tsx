export default function FormatIcon({ format, small }: { format: string; small?: boolean }) {
  const size = small ? "h-4 w-4" : "h-7 w-7";
  const isPdf = format === "pdf";
  const isAny = format === "any";

  return (
    <div
      className={`flex items-center justify-center transition-transform duration-300 group-hover/card:scale-110 ${
        isPdf
          ? "text-red-300"
          : isAny
            ? "text-brand/80"
            : small
              ? "text-neutral-300"
              : "text-brand/90"
      } ${small ? "h-6 w-6" : ""}`}
    >
      {isPdf ? (
        <svg className={size} viewBox="0 0 576 512" fill="currentColor">
          <path d="M96 0C60.7 0 32 28.7 32 64V384c0 35.3 28.7 64 64 64H256V352c0-17.7 14.3-32 32-32s32 14.3 32 32v96h96c35.3 0 64-28.7 64-64V160H352c-17.7 0-32-14.3-32-32V0H96zm192 0V128h96L288 0zM96 224c-17.7 0-32 14.3-32 32s14.3 32 32 32H224c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z" />
        </svg>
      ) : isAny ? (
        <svg className={size} viewBox="0 0 384 512" fill="currentColor">
          <path d="M64 464c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16H224v80c0 17.7 14.3 32 32 32h80V448c0 8.8-7.2 16-16 16H64zM64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V154.5c0-17-6.7-33.3-18.7-45.3L274.7 18.7C262.7 6.7 246.5 0 229.5 0H64zm56 256c-13.3 0-24 10.7-24 24s10.7 24 24 24H264c13.3 0 24-10.7 24-24s-10.7-24-24-24H120z" />
        </svg>
      ) : (
        <svg className={size} viewBox="0 0 384 512" fill="currentColor">
          <path d="M64 464c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16H224v80c0 17.7 14.3 32 32 32h80V448c0 8.8-7.2 16-16 16H64zM64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V154.5c0-17-6.7-33.3-18.7-45.3L274.7 18.7C262.7 6.7 246.5 0 229.5 0H64zm48 256c-13.3 0-24 10.7-24 24s10.7 24 24 24H264c13.3 0 24-10.7 24-24s-10.7-24-24-24H112z" />
        </svg>
      )}
    </div>
  );
}
