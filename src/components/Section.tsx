import GridCells from "@/components/GridCells";
import ItemRenderer from "@/components/ItemRenderer";
import DragPreview from "@/components/DragPreview";
import { GAP } from "@/constants/grid";
import { useLayoutStore } from "@/store/useLayoutStore";
import { usePageStore, Section as SectionType } from "@/store/usePageStore";

interface SectionProps {
  section: SectionType;
  isSelected: boolean;
  gridVisibleSectionId: string | null;
  dragPreview: {
    sectionId: string;
    gridX: number;
    gridY: number;
    cellWidth: number;
    cellHeight: number;
  } | null;
  gridRef: React.RefObject<HTMLDivElement | null> | null;
  sectionIndex: number;
  onSectionClick: (sectionId: string) => void;
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

export default function Section({
  section,
  isSelected,
  gridVisibleSectionId,
  dragPreview,
  gridRef,
  sectionIndex,
  onSectionClick,
  onBackgroundColorChange,
  onSectionDragOver,
  onSectionDragLeave,
  onSectionDrop,
  // onShapeDragStart,
  // onShapeDragEnd,
  onToggleGridVisibility,
  onItemDragStop,
  onItemResizeStop,
  onItemContentUpdate,
  onSectionResizeStart,
}: SectionProps) {
  // Zustand 스토어에서 grid 정보 가져오기 (각 상태를 개별적으로 구독)
  const cellWidth = useLayoutStore((state) => state.cellWidth);
  const cellHeight = useLayoutStore((state) => state.cellHeight);
  const gridCols = useLayoutStore((state) => state.gridCols);

  const { setSelectedItemId } = usePageStore();

  // const shapeItems = section.items.filter(
  //   (item): item is ShapeItem =>
  //     item.type === "circle" ||
  //     item.type === "triangle" ||
  //     item.type === "rectangle"
  // );

  return (
    <div
      className="w-full py-2 relative cursor-pointer transition-all group"
      style={{ backgroundColor: section.backgroundColor }}
      onClick={() => onSectionClick(section.id)}
      onDragOver={(e) => onSectionDragOver(e, section.id, section.height)}
      onDragLeave={onSectionDragLeave}
      onDrop={(e) => onSectionDrop(e, section.id)}
    >
      <div
        className="max-w-[1920px] mx-auto px-4"
        onClick={() => setSelectedItemId(null)}
      >
        <div className="relative">
          <div
            ref={sectionIndex === 0 ? gridRef : null}
            className="w-full grid grid-cols-12 md:grid-cols-24 gap-2"
            style={{
              gridTemplateRows: `repeat(${section.height}, ${cellHeight}px)`,
              height: `${
                section.height * cellHeight + (section.height - 1) * GAP
              }px`,
            }}
          >
            {/* 그리드 셀 */}
            <GridCells
              gridCols={gridCols}
              sectionHeight={section.height}
              gridVisibleSectionId={gridVisibleSectionId}
              currentSectionId={section.id}
            />

            {/* 섹션 내 아이템들 (도형 제외) */}
            {cellWidth > 0 && (
              <ItemRenderer
                items={section.items}
                gridVisibleSectionId={gridVisibleSectionId}
                sectionId={section.id}
                onToggleGridVisibility={onToggleGridVisibility}
                onItemDragStop={onItemDragStop}
                onItemResizeStop={onItemResizeStop}
                onItemContentUpdate={onItemContentUpdate}
              />
            )}

            {/* 드래그 미리보기 박스 */}
            <DragPreview
              dragPreview={dragPreview}
              currentSectionId={section.id}
            />
          </div>

          {/* 섹션 리사이즈 핸들 */}
          <div
            className="h-px border-t border-dashed border-gray-400 hover:border-blue-500 cursor-ns-resize transition-colors mt-4"
            onMouseDown={(e) =>
              onSectionResizeStart(section.id, section.height, e)
            }
          ></div>
        </div>
      </div>
    </div>
  );
}
