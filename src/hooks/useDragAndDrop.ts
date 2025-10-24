import { useState } from "react";
import { AddableItemType } from "@/types/item";
import { ITEM_GRID_SIZE } from "@/constants/itemConfig";
import { getGridCoordinatesFromEvent } from "@/lib/gridCalculations";

interface DragPreview {
  sectionId: string;
  gridX: number;
  gridY: number;
  cellWidth: number;
  cellHeight: number;
}

interface UseDragAndDropProps {
  cellWidth: number;
  cellHeight: number;
  gridCols: number;
  addItem: (
    sectionId: string,
    itemType: AddableItemType,
    x: number,
    y: number
  ) => void;
  sections: Array<{ id: string; height: number }>;
  onShowGrid?: (sectionId: string) => void;
  onHideGrid?: () => void;
}

interface UseDragAndDropReturn {
  draggedItemType: string | null;
  dragPreview: DragPreview | null;
  handleLNBDragStart: (
    e: React.DragEvent<HTMLButtonElement>,
    itemType: string
  ) => void;
  handleSectionDragOver: (
    e: React.DragEvent<HTMLDivElement>,
    sectionId: string,
    sectionHeight: number
  ) => void;
  handleSectionDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleSectionDrop: (
    e: React.DragEvent<HTMLDivElement>,
    sectionId: string
  ) => void;
  resetDragState: () => void;
}

/**
 * 드래그 앤 드롭 로직을 관리하는 커스텀 훅
 * LNB에서 캔버스로 아이템을 드래그 앤 드롭할 때의 상태와 이벤트 핸들러를 제공합니다.
 */
export const useDragAndDrop = ({
  cellWidth,
  cellHeight,
  gridCols,
  addItem,
  sections,
  onShowGrid,
  onHideGrid,
}: UseDragAndDropProps): UseDragAndDropReturn => {
  const [draggedItemType, setDraggedItemType] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);

  // LNB에서 아이템 드래그 시작
  const handleLNBDragStart = (
    e: React.DragEvent<HTMLButtonElement>,
    itemType: string
  ) => {
    setDraggedItemType(itemType);
    e.dataTransfer.effectAllowed = "copy";
  };

  // 섹션 드래그 오버
  const handleSectionDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    sectionId: string,
    sectionHeight: number
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";

    if (!draggedItemType) return;

    // 드래그 중 그리드 가시성 활성화
    onShowGrid?.(sectionId);

    // 마우스 좌표를 그리드 좌표로 변환
    const sectionElement = e.currentTarget;
    const coordinates = getGridCoordinatesFromEvent(
      e,
      sectionElement,
      cellWidth,
      cellHeight,
      gridCols,
      sectionHeight
    );

    if (!coordinates) return;

    // 아이템의 그리드 크기 가져오기
    const itemSize = ITEM_GRID_SIZE[draggedItemType as AddableItemType];

    // 미리보기 상태 업데이트
    setDragPreview({
      sectionId,
      gridX: coordinates.x,
      gridY: coordinates.y,
      cellWidth: itemSize.cellWidth,
      cellHeight: itemSize.cellHeight,
    });
  };

  // 섹션 드래그 리브
  const handleSectionDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // 자식 요소로 나간 것이 아닌 경우에만 초기화
    if (e.currentTarget === e.target) {
      setDragPreview(null);
      onHideGrid?.();
    }
  };

  // 섹션 드롭
  const handleSectionDrop = (
    e: React.DragEvent<HTMLDivElement>,
    sectionId: string
  ) => {
    e.preventDefault();

    if (!draggedItemType) return;

    // 마우스 좌표를 그리드 좌표로 변환
    const sectionElement = e.currentTarget;
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const coordinates = getGridCoordinatesFromEvent(
      e,
      sectionElement,
      cellWidth,
      cellHeight,
      gridCols,
      section.height
    );

    if (!coordinates) return;

    // 드롭한 위치에 아이템 추가
    addItem(
      sectionId,
      draggedItemType as AddableItemType,
      coordinates.x,
      coordinates.y
    );

    // 드래그 상태 초기화
    resetDragState();
  };

  // 드래그 상태 초기화
  const resetDragState = () => {
    setDraggedItemType(null);
    setDragPreview(null);
    onHideGrid?.();
  };

  return {
    draggedItemType,
    dragPreview,
    handleLNBDragStart,
    handleSectionDragOver,
    handleSectionDragLeave,
    handleSectionDrop,
    resetDragState,
  };
};
