import Section from "@/components/Section";
import { Section as SectionType } from "@/hooks/usePageState";

interface CanvasProps {
  sections: SectionType[];
  selectedSectionId: string;
  gridVisibleSectionId: string | null;
  cellWidth: number;
  cellHeight: number;
  gridCols: number;
  isMobile: boolean;
  dragPreview: {
    sectionId: string;
    gridX: number;
    gridY: number;
    cellWidth: number;
    cellHeight: number;
  } | null;
  gridRef: React.RefObject<HTMLDivElement | null>;
  onSectionClick: (sectionId: string) => void;
  onBackgroundColorChange: (sectionId: string, color: string) => void;
  onSectionDragOver: (e: React.DragEvent<HTMLDivElement>, sectionId: string, height: number) => void;
  onSectionDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onSectionDrop: (e: React.DragEvent<HTMLDivElement>, sectionId: string) => void;
  onShapeDragStart: (sectionId: string) => void;
  onShapeDragEnd: (sectionId: string, itemId: string, newX: number, newY: number) => void;
  onToggleGridVisibility: (sectionId: string, visible: boolean) => void;
  onItemDragStop: (sectionId: string, itemId: string, newCol: number, newRow: number) => void;
  onItemResizeStop: (
    sectionId: string,
    itemId: string,
    newCol: number,
    newRow: number,
    newWidth: number,
    newHeight: number
  ) => void;
  onSectionResizeStart: (sectionId: string, height: number, e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function Canvas({
  sections,
  selectedSectionId,
  gridVisibleSectionId,
  cellWidth,
  cellHeight,
  gridCols,
  isMobile,
  dragPreview,
  gridRef,
  onSectionClick,
  onBackgroundColorChange,
  onSectionDragOver,
  onSectionDragLeave,
  onSectionDrop,
  onShapeDragStart,
  onShapeDragEnd,
  onToggleGridVisibility,
  onItemDragStop,
  onItemResizeStop,
  onSectionResizeStart,
}: CanvasProps) {
  return (
    <div className="w-full">
      {sections.map((section, sectionIndex) => (
        <Section
          key={section.id}
          section={section}
          isSelected={section.id === selectedSectionId}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          gridCols={gridCols}
          gridVisibleSectionId={gridVisibleSectionId}
          isMobile={isMobile}
          dragPreview={dragPreview}
          gridRef={sectionIndex === 0 ? gridRef : null}
          sectionIndex={sectionIndex}
          onSectionClick={onSectionClick}
          onBackgroundColorChange={onBackgroundColorChange}
          onSectionDragOver={onSectionDragOver}
          onSectionDragLeave={onSectionDragLeave}
          onSectionDrop={onSectionDrop}
          onShapeDragStart={onShapeDragStart}
          onShapeDragEnd={onShapeDragEnd}
          onToggleGridVisibility={onToggleGridVisibility}
          onItemDragStop={onItemDragStop}
          onItemResizeStop={onItemResizeStop}
          onSectionResizeStart={onSectionResizeStart}
        />
      ))}
    </div>
  );
}
