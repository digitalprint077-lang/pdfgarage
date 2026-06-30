import { useParams, Navigate } from "react-router-dom";
import App from "../App";
import { TOOLS } from "../data/catalog";

export default function ToolPage() {
  const { toolId } = useParams();
  const tool = TOOLS.find((t) => t.id === toolId);
  if (!tool) return <Navigate to="/" replace />;
  return <App tool={tool} />;
}
