import { useLayoutEffect, useState } from "react";

export type DropdownMotionState = "open" | "closed";

export function useDropdownMotion(open: boolean, onClosed?: () => void) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<DropdownMotionState>("closed");

  useLayoutEffect(() => {
    if (open) {
      setMounted(true);
      setState("closed");
      let frame1 = 0;
      let frame2 = 0;
      frame1 = requestAnimationFrame(() => {
        frame2 = requestAnimationFrame(() => setState("open"));
      });
      return () => {
        cancelAnimationFrame(frame1);
        cancelAnimationFrame(frame2);
      };
    }

    if (mounted) setState("closed");
  }, [open, mounted]);

  const handleTransitionEnd = (event: React.TransitionEvent) => {
    if (event.propertyName !== "opacity" || open || state !== "closed") return;
    setMounted(false);
    onClosed?.();
  };

  return { mounted, state, handleTransitionEnd };
}
