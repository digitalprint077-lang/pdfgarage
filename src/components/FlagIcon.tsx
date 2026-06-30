import US from "country-flag-icons/react/3x2/US";
import ES from "country-flag-icons/react/3x2/ES";
import FR from "country-flag-icons/react/3x2/FR";
import DE from "country-flag-icons/react/3x2/DE";
import CN from "country-flag-icons/react/3x2/CN";
import SA from "country-flag-icons/react/3x2/SA";
import IN from "country-flag-icons/react/3x2/IN";
import PK from "country-flag-icons/react/3x2/PK";
import BR from "country-flag-icons/react/3x2/BR";
import JP from "country-flag-icons/react/3x2/JP";
import IT from "country-flag-icons/react/3x2/IT";
import RU from "country-flag-icons/react/3x2/RU";
import KR from "country-flag-icons/react/3x2/KR";
import TR from "country-flag-icons/react/3x2/TR";
import NL from "country-flag-icons/react/3x2/NL";
import PL from "country-flag-icons/react/3x2/PL";
import ID from "country-flag-icons/react/3x2/ID";
import VN from "country-flag-icons/react/3x2/VN";
import type { SVGProps } from "react";

type FlagComponent = (props: SVGProps<SVGSVGElement>) => JSX.Element;

const FLAGS: Record<string, FlagComponent> = {
  US,
  ES,
  FR,
  DE,
  CN,
  SA,
  IN,
  PK,
  BR,
  JP,
  IT,
  RU,
  KR,
  TR,
  NL,
  PL,
  ID,
  VN,
};

interface FlagIconProps {
  country: string;
  className?: string;
  title?: string;
}

/** Small 3:2 SVG country flag — works on Windows (unlike emoji flags). */
export default function FlagIcon({ country, className, title }: FlagIconProps) {
  const Flag = FLAGS[country.toUpperCase()];
  const base = "inline-block shrink-0 rounded-[2px] shadow-sm ring-1 ring-black/20";
  const size = className ?? "h-3.5 w-[1.375rem]";

  if (!Flag) {
    return (
      <span
        className={`${base} ${size} bg-white/10`}
        title={title}
        aria-hidden
      />
    );
  }

  return <Flag className={`${base} ${size}`} title={title} aria-hidden />;
}

export { FLAGS };
