import { useState, useEffect, useRef } from "react";
import { CELL_ASPECT_RATIO } from "@/constants/grid";

interface UseGridDimensionsReturn {
  cellWidth: number;
  cellHeight: number;
  gridCols: number;
  isMobile: boolean;
  gridRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * 반응형 그리드 크기를 계산하고 관리하는 커스텀 훅
 * 셀 너비와 높이(비율 1.6:1)를 계산하고, 반응형 그리드 컬럼 수를 관리합니다.
 */
export const useGridDimensions = (): UseGridDimensionsReturn => {
  const gridRef = useRef<HTMLDivElement>(null);

  const [cellWidth, setCellWidth] = useState(0);
  const [cellHeight, setCellHeight] = useState(0);
  const [gridCols, setGridCols] = useState(24);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateCellSize = () => {
      if (gridRef.current) {
        // 화면 너비에 따라 컬럼 수 조정
        const width = window.innerWidth;
        const cols = width < 768 ? 12 : 24; // 모바일: 12, 데스크톱: 24
        const mobile = width < 768;

        setGridCols(cols);
        setIsMobile(mobile);

        // CSS Grid가 실제로 렌더링한 셀 크기를 측정
        const firstCell = gridRef.current.querySelector(
          '[data-row="0"][data-col="0"]'
        ) as HTMLElement;
        if (firstCell) {
          // getBoundingClientRect()로 브라우저가 최종 계산한 실제 셀 너비를 가져옴
          const rect = firstCell.getBoundingClientRect();
          const calculatedCellWidth = rect.width;
          // 비율을 유지하여 높이 계산
          const calculatedCellHeight = calculatedCellWidth / CELL_ASPECT_RATIO;

          setCellWidth(calculatedCellWidth);
          setCellHeight(calculatedCellHeight);
        }
      }
    };

    // ResizeObserver로 그리드가 실제로 리사이즈될 때마다 측정
    let resizeObserver: ResizeObserver | null = null;

    if (gridRef.current) {
      resizeObserver = new ResizeObserver(() => {
        // requestAnimationFrame으로 브라우저가 레이아웃 계산을 마친 후 측정
        requestAnimationFrame(updateCellSize);
      });
      resizeObserver.observe(gridRef.current);
    }

    // 초기 측정
    updateCellSize();

    // window resize도 감지 (ResizeObserver의 백업)
    window.addEventListener("resize", updateCellSize);

    return () => {
      window.removeEventListener("resize", updateCellSize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return {
    cellWidth,
    cellHeight,
    gridCols,
    isMobile,
    gridRef,
  };
};
