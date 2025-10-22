import PixiCanvas from "@/components/PixiCanvas";
import GridCells from "@/components/GridCells";
import ItemRenderer from "@/components/ItemRenderer";
import DragPreview from "@/components/DragPreview";
import { Section as SectionType } from "@/hooks/usePageState";
import { ShapeItem } from "@/types/item";
import { GAP } from "@/constants/grid";
import { useGridStore } from "@/store/useGridStore";
import { useSectionStore } from "@/store/useSectionStore";

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
  onShapeDragStart,
  onShapeDragEnd,
  onToggleGridVisibility,
  onItemDragStop,
  onItemResizeStop,
  onItemContentUpdate,
  onSectionResizeStart,
}: SectionProps) {
  // Zustand 스토어에서 grid 정보 가져오기 (각 상태를 개별적으로 구독)
  const cellWidth = useGridStore((state) => state.cellWidth);
  const cellHeight = useGridStore((state) => state.cellHeight);
  const gridCols = useGridStore((state) => state.gridCols);
  const isMobile = useGridStore((state) => state.isMobile);

  const { setSelectedItemId } = useSectionStore();

  const shapeItems = section.items.filter(
    (item): item is ShapeItem =>
      item.type === "circle" ||
      item.type === "triangle" ||
      item.type === "rectangle"
  );

  return (
    <div
      className="w-full py-2 relative cursor-pointer transition-all group"
      style={{ backgroundColor: section.backgroundColor }}
      onClick={() => onSectionClick(section.id)}
      onDragOver={(e) => onSectionDragOver(e, section.id, section.height)}
      onDragLeave={onSectionDragLeave}
      onDrop={(e) => onSectionDrop(e, section.id)}
    >
      {/* 선택 버튼 오버레이 (선택되지 않은 섹션에만 표시) */}
      {!isSelected && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <button
            className="px-6 py-3 bg-white text-black rounded-lg shadow-lg pointer-events-auto font-medium"
            onClick={(e) => {
              e.stopPropagation();
              onSectionClick(section.id);
            }}
          >
            섹션 선택하기
          </button>
        </div>
      )}

      {/* 호버 시 어두운 배경 (선택되지 않은 섹션) */}
      {!isSelected && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 pointer-events-none"></div>
      )}

      <div
        className="max-w-[1920px] mx-auto px-4"
        onClick={() => setSelectedItemId(null)}
      >
        {/* 선택된 섹션에 컬러 피커 표시 */}
        {isSelected && (
          <div className="mb-4 flex items-center gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
            <label className="text-sm font-medium text-gray-700">배경색:</label>
            <input
              type="color"
              value={section.backgroundColor}
              onChange={(e) =>
                onBackgroundColorChange(section.id, e.target.value)
              }
              className="w-12 h-8 rounded cursor-pointer border border-gray-300"
            />
            <input
              type="text"
              value={section.backgroundColor}
              onChange={(e) =>
                onBackgroundColorChange(section.id, e.target.value)
              }
              className="px-2 py-1 text-sm border border-gray-300 rounded w-24"
              placeholder="#ffffff"
            />
          </div>
        )}

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

            {/* Pixi.js 도형 캔버스 */}
            {cellWidth > 0 && (
              <PixiCanvas
                sectionId={section.id}
                items={shapeItems}
                cellWidth={cellWidth}
                cellHeight={cellHeight}
                gap={GAP}
                gridCols={gridCols}
                sectionHeight={section.height}
                isMobile={isMobile}
                onShapeDragStart={() => onShapeDragStart(section.id)}
                onShapeDragEnd={(itemId, newX, newY) =>
                  onShapeDragEnd(section.id, itemId, newX, newY)
                }
              />
            )}

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
