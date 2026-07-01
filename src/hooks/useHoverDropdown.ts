import { useCallback, useEffect, useRef, useState } from "react";

const CLOSE_DELAY_MS = 160;

export function useHoverDropdown() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = undefined;
    }
  }, []);

  const openMenu = useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }, [cancelClose]);

  const closeMenu = useCallback(() => {
    cancelClose();
    setOpen(false);
  }, [cancelClose]);

  useEffect(() => cancelClose, [cancelClose]);

  const hoverZoneProps = {
    onMouseEnter: openMenu,
    onMouseLeave: scheduleClose,
  };

  const panelHoverProps = {
    onMouseEnter: openMenu,
    onMouseLeave: scheduleClose,
  };

  return {
    open,
    setOpen,
    openMenu,
    scheduleClose,
    closeMenu,
    hoverZoneProps,
    panelHoverProps,
  };
}
