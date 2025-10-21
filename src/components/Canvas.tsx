import Section from "@/components/Section";
import { Section as SectionType } from "@/hooks/usePageState";
import { useSectionStore } from "@/store/useSectionStore";

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
  onSectionResizeStart,
}: CanvasProps) {
  // Zustand 스토어에서 선택된 섹션 가져오기 (각 상태를 개별적으로 구독)
  const selectedSectionId = useSectionStore((state) => state.selectedSectionId);
  const setSelectedSectionId = useSectionStore((state) => state.setSelectedSectionId);
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
          onSectionResizeStart={onSectionResizeStart}
        />
      ))}
    </div>
  );
}
