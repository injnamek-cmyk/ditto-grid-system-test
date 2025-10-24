import Section from "@/components/Section";
import { usePageStore, Section as SectionType } from "@/store/usePageStore";

interface CanvasProps {
  sections: SectionType[];
  gridVisibleSectionId: string | null;
  dragPreview: {
    sectionId: string;
    gridX: number;
    gridY: number;
    cellWidth: number;
    cellHeight: number;
  } | null;
  gridRef: React.RefObject<HTMLDivElement | null>;
  onBackgroundColorChange: (sectionId: string, color: string) => void;
  onSectionDragOver: (
    e: React.DragEvent<HTMLDivElement>,
    sectionId: string,
    height: number
  ) => void;
  onSectionDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onSectionDrop: (
    e: React.DragEvent<HTMLDivElement>,
    sectionId: string
  ) => void;
  onShapeDragStart: (sectionId: string) => void;
  onShapeDragEnd: (
    sectionId: string,
    itemId: string,
    newX: number,
    newY: number
  ) => void;
  onToggleGridVisibility: (sectionId: string, visible: boolean) => void;
  onItemDragStop: (
    sectionId: string,
    itemId: string,
    newCol: number,
    newRow: number
  ) => void;
  onItemResizeStop: (
    sectionId: string,
    itemId: string,
    newCol: number,
    newRow: number,
    newWidth: number,
    newHeight: number
  ) => void;
  onItemContentUpdate?: (
    sectionId: string,
    itemId: string,
    content: string
  ) => void;
  onSectionResizeStart: (
    sectionId: string,
    height: number,
    e: React.MouseEvent<HTMLDivElement>
  ) => void;
}

export default function Canvas({
  sections,
  gridVisibleSectionId,
  dragPreview,
  gridRef,
  onBackgroundColorChange,
  onSectionDragOver,
  onSectionDragLeave,
  onSectionDrop,
  onShapeDragStart,
  onShapeDragEnd,
  onToggleGridVisibility,
  onItemDragStop,
  onItemResizeStop,
  onItemContentUpdate,
  onSectionResizeStart,
}: CanvasProps) {
  const { selectedSectionId, setSelectedSectionId } = usePageStore();

  return (
    <div className="w-full">
      {sections.map((section, sectionIndex) => (
        <Section
          key={section.id}
          section={section}
          isSelected={section.id === selectedSectionId}
          gridVisibleSectionId={gridVisibleSectionId}
          dragPreview={dragPreview}
          gridRef={sectionIndex === 0 ? gridRef : null}
          sectionIndex={sectionIndex}
          onSectionClick={setSelectedSectionId}
          onBackgroundColorChange={onBackgroundColorChange}
          onSectionDragOver={onSectionDragOver}
          onSectionDragLeave={onSectionDragLeave}
          onSectionDrop={onSectionDrop}
          onShapeDragStart={onShapeDragStart}
          onShapeDragEnd={onShapeDragEnd}
          onToggleGridVisibility={onToggleGridVisibility}
          onItemDragStop={onItemDragStop}
          onItemResizeStop={onItemResizeStop}
          onItemContentUpdate={onItemContentUpdate}
          onSectionResizeStart={onSectionResizeStart}
        />
      ))}
    </div>
  );
}
