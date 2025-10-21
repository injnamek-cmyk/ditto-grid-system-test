import { GAP } from "@/constants/grid";

interface DragPreviewProps {
  dragPreview: {
    sectionId: string;
    gridX: number;
    gridY: number;
    cellWidth: number;
    cellHeight: number;
  } | null;
  currentSectionId: string;
  cellWidth: number;
  cellHeight: number;
}

export default function DragPreview({
  dragPreview,
  currentSectionId,
  cellWidth,
  cellHeight,
}: DragPreviewProps) {
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
          dragPreview.cellWidth * cellWidth +
          (dragPreview.cellWidth - 1) * GAP
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
