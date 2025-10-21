import { useState } from "react";

interface UseGridVisibilityReturn {
  gridVisibleSectionId: string | null;
  showGrid: (sectionId: string) => void;
  hideGrid: () => void;
  toggleGridVisibility: (sectionId: string, visible: boolean) => void;
}

/**
 * 그리드 가시성을 관리하는 커스텀 훅
 * 드래그/리사이즈 중일 때 그리드를 표시하거나 숨깁니다.
 */
export const useGridVisibility = (): UseGridVisibilityReturn => {
  const [gridVisibleSectionId, setGridVisibleSectionId] = useState<
    string | null
  >(null);

  const showGrid = (sectionId: string) => {
    setGridVisibleSectionId(sectionId);
  };

  const hideGrid = () => {
    setGridVisibleSectionId(null);
  };

  const toggleGridVisibility = (sectionId: string, visible: boolean) => {
    setGridVisibleSectionId(visible ? sectionId : null);
  };

  return {
    gridVisibleSectionId,
    showGrid,
    hideGrid,
    toggleGridVisibility,
  };
};
