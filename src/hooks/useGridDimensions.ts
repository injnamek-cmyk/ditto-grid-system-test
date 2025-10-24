import { useEffect, useRef } from "react";
import { CELL_ASPECT_RATIO } from "@/constants/grid";
import { useLayoutStore } from "@/store/useLayoutStore";

interface UseGridDimensionsReturn {
  gridRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * 반응형 그리드 크기를 계산하고 관리하는 커스텀 훅
 * 셀 너비와 높이(비율 1.6:1)를 계산하고, 반응형 그리드 컬럼 수를 관리합니다.
 * 계산된 값은 useLayoutStore에 자동으로 저장되므로, 이 훅은 gridRef만 반환합니다.
 *
 * 다른 컴포넌트에서 계산 결과를 사용할 때는:
 * const { cellWidth, cellHeight, gridCols, isMobile } = useLayoutStore();
 */
export const useGridDimensions = (): UseGridDimensionsReturn => {
  const gridRef = useRef<HTMLDivElement>(null);

  const setGridDimensions = useLayoutStore((state) => state.setGridDimensions);

  useEffect(() => {
    const updateCellSize = () => {
      if (gridRef.current) {
        // 화면 너비에 따라 컬럼 수 조정
        const width = window.innerWidth;
        const cols = width < 768 ? 12 : 24; // 모바일: 12, 데스크톱: 24
        const mobile = width < 768;

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

          // 계산된 값을 LayoutStore에 저장
          setGridDimensions(
            calculatedCellWidth,
            calculatedCellHeight,
            cols,
            mobile
          );
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
  }, [setGridDimensions]);

  return {
    gridRef,
  };
};
