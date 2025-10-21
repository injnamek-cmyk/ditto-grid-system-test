import { useState } from "react";
import { GAP } from "@/constants/grid";

interface UseSectionResizeReturn {
  resizingSectionId: string | null;
  setResizingSectionId: (id: string | null) => void;
  handleResizeStart: (
    sectionId: string,
    sectionHeight: number,
    e: React.MouseEvent
  ) => void;
  updateSectionHeight: (callback: (newHeight: number) => void) => void;
}

/**
 * 섹션 리사이즈 로직을 관리하는 커스텀 훅
 * @param cellHeight - 셀 높이 (px)
 * @returns 리사이즈 상태와 핸들러
 */
export const useSectionResize = (
  cellHeight: number
): UseSectionResizeReturn => {
  const [resizingSectionId, setResizingSectionId] = useState<string | null>(
    null
  );
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeStartHeight, setResizeStartHeight] = useState(0);

  const handleResizeStart = (
    sectionId: string,
    sectionHeight: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    setResizingSectionId(sectionId);
    setResizeStartY(e.clientY);
    setResizeStartHeight(sectionHeight);
  };

  const updateSectionHeight = (callback: (newHeight: number) => void) => {
    if (resizingSectionId === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - resizeStartY;
      const rowHeight = cellHeight + GAP;
      const deltaRows = Math.round(deltaY / rowHeight);
      const newHeight = Math.max(12, resizeStartHeight + deltaRows); // 최소 12행

      callback(newHeight);
    };

    const handleMouseUp = () => {
      setResizingSectionId(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  };

  return {
    resizingSectionId,
    setResizingSectionId,
    handleResizeStart,
    updateSectionHeight,
  };
};
