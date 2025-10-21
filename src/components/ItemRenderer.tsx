import { Rnd } from "react-rnd";
import { Item } from "@/types/item";
import { GAP } from "@/constants/grid";

interface ItemRendererProps {
  items: Item[];
  cellWidth: number;
  cellHeight: number;
  isMobile: boolean;
  gridVisibleSectionId: string | null;
  sectionId: string;
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
}

export default function ItemRenderer({
  items,
  cellWidth,
  cellHeight,
  isMobile,
  gridVisibleSectionId,
  sectionId,
  onToggleGridVisibility,
  onItemDragStop,
  onItemResizeStop,
}: ItemRendererProps) {
  // 섹션 내 아이템들 (도형 제외)
  const nonShapeItems = items.filter(
    (item) =>
      item.type !== "circle" &&
      item.type !== "triangle" &&
      item.type !== "rectangle"
  );

  return (
    <>
      {nonShapeItems.map((item) => {
        const currentItem = isMobile ? item.mobile : item.desktop;

        return (
          <Rnd
            key={item.id}
            position={{
              x: currentItem.x * (cellWidth + GAP),
              y: currentItem.y * (cellHeight + GAP),
            }}
            size={{
              width:
                currentItem.width * cellWidth +
                (currentItem.width - 1) * GAP,
              height:
                currentItem.height * cellHeight +
                (currentItem.height - 1) * GAP,
            }}
            onDragStart={() => onToggleGridVisibility(sectionId, true)}
            onDrag={() => {
              if (gridVisibleSectionId !== sectionId) {
                onToggleGridVisibility(sectionId, true);
              }
            }}
            onDragStop={(_, d) => {
              onToggleGridVisibility(sectionId, false);
              const newCol = Math.round(d.x / (cellWidth + GAP));
              const newRow = Math.round(d.y / (cellHeight + GAP));
              onItemDragStop(sectionId, item.id, newCol, newRow);
            }}
            onResizeStart={() => onToggleGridVisibility(sectionId, true)}
            onResize={() => {
              if (gridVisibleSectionId !== sectionId) {
                onToggleGridVisibility(sectionId, true);
              }
            }}
            onResizeStop={(_, __, ref, ___, position) => {
              onToggleGridVisibility(sectionId, false);

              const newWidth = Math.round(
                ref.offsetWidth / (cellWidth + GAP)
              );
              const newHeight = Math.round(
                ref.offsetHeight / (cellHeight + GAP)
              );
              const newCol = Math.round(position.x / (cellWidth + GAP));
              const newRow = Math.round(position.y / (cellHeight + GAP));

              onItemResizeStop(
                sectionId,
                item.id,
                newCol,
                newRow,
                newWidth,
                newHeight
              );
            }}
            dragGrid={[cellWidth + GAP, cellHeight + GAP]}
            resizeGrid={[cellWidth + GAP, cellHeight + GAP]}
            bounds="parent"
            className="absolute"
            enableUserSelectHack={false}
          >
            {item.type === "button" ? (
              <button className="w-full h-full bg-blue-500 hover:bg-blue-600 text-white rounded-md cursor-move flex items-center justify-center text-sm font-semibold shadow-md hover:shadow-lg transition-all border border-blue-600">
                Button
              </button>
            ) : item.type === "text" ? (
              <div className="w-full h-full bg-white rounded-md cursor-move flex items-center justify-center text-gray-700 text-sm font-normal shadow-md hover:shadow-lg transition-shadow border border-gray-200 px-2">
                텍스트 입력
              </div>
            ) : (
              <div className="w-full h-full bg-white rounded-md cursor-move flex items-center justify-center text-gray-400 text-sm font-medium shadow-md hover:shadow-lg transition-shadow border border-gray-200"></div>
            )}
          </Rnd>
        );
      })}
    </>
  );
}
