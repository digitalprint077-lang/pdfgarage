import { Link } from "react-router-dom";

interface LegalLinksProps {
  className?: string;
  separator?: string;
}

export default function LegalLinks({ className = "text-gray-500", separator = " · " }: LegalLinksProps) {
  return (
    <span className={className}>
      <Link to="/privacy" className="transition hover:text-brand">
        Privacy
      </Link>
      {separator}
      <Link to="/terms" className="transition hover:text-brand">
        Terms
      </Link>
    </span>
  );
}
