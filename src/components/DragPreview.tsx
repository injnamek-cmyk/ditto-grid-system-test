import { GAP } from "@/constants/grid";
import { useGridStore } from "@/store/useLayoutStore";

interface DragPreviewProps {
  dragPreview: {
    sectionId: string;
    gridX: number;
    gridY: number;
    cellWidth: number;
    cellHeight: number;
  } | null;
  currentSectionId: string;
}

export default function DragPreview({
  dragPreview,
  currentSectionId,
}: DragPreviewProps) {
  // Zustand 스토어에서 grid 정보 가져오기 (각 상태를 개별적으로 구독)
  const cellWidth = useGridStore((state) => state.cellWidth);
  const cellHeight = useGridStore((state) => state.cellHeight);
  if (!dragPreview || dragPreview.sectionId !== currentSectionId) {
    return null;
  }

  return (
    <div
      className="absolute border-2 border-dashed border-blue-400 pointer-events-none"
      style={{
        left: `${dragPreview.gridX * (cellWidth + GAP)}px`,
        top: `${dragPreview.gridY * (cellHeight + GAP)}px`,
        width: `${
          dragPreview.cellWidth * cellWidth + (dragPreview.cellWidth - 1) * GAP
        }px`,
        height: `${
          dragPreview.cellHeight * cellHeight +
          (dragPreview.cellHeight - 1) * GAP
        }px`,
        backgroundColor: "rgba(59, 130, 246, 0.05)",
      }}
    />
  );
}
