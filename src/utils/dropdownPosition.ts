export type DropdownPlacement = "below" | "above";

export interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  placement: DropdownPlacement;
  transformOrigin: string;
  maxHeight?: number;
}

interface DropdownPositionOptions {
  anchor: DOMRect;
  panelHeight: number;
  width: number;
  gap?: number;
  viewportPad?: number;
  align?: "start" | "center";
}

export function computeDropdownPosition({
  anchor,
  panelHeight,
  width,
  gap = 8,
  viewportPad = 12,
  align = "start",
}: DropdownPositionOptions): DropdownPosition {
  const clampedWidth = Math.min(width, window.innerWidth - viewportPad * 2);

  let left =
    align === "center"
      ? anchor.left + anchor.width / 2 - clampedWidth / 2
      : anchor.left;
  left = Math.max(viewportPad, Math.min(left, window.innerWidth - clampedWidth - viewportPad));

  let top = anchor.bottom + gap;
  let placement: DropdownPlacement = "below";
  if (top + panelHeight > window.innerHeight - viewportPad) {
    top = Math.max(viewportPad, anchor.top - panelHeight - gap);
    placement = "above";
  }

  const anchorOriginX = anchor.left + anchor.width / 2 - left;
  const transformOrigin =
    placement === "below"
      ? align === "start"
        ? "0px 0px"
        : `${anchorOriginX}px 0px`
      : align === "start"
        ? `0px ${panelHeight}px`
        : `${anchorOriginX}px ${panelHeight}px`;

  return {
    top,
    left,
    width: clampedWidth,
    placement,
    transformOrigin,
  };
}
