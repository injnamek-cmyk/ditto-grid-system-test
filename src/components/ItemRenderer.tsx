import { Rnd } from "react-rnd";
import { useState } from "react";
import { Item } from "@/types/item";
import { GAP } from "@/constants/grid";
import { useGridStore } from "@/store/useGridStore";
import { useSectionStore } from "@/store/useSectionStore";

interface ItemRendererProps {
  items: Item[];
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
  onItemContentUpdate?: (
    sectionId: string,
    itemId: string,
    content: string
  ) => void;
}

export default function ItemRenderer({
  items,
  gridVisibleSectionId,
  sectionId,
  onToggleGridVisibility,
  onItemDragStop,
  onItemResizeStop,
  onItemContentUpdate,
}: ItemRendererProps) {
  // Zustand 스토어에서 grid 정보 가져오기 (각 상태를 개별적으로 구독)
  const cellWidth = useGridStore((state) => state.cellWidth);
  const cellHeight = useGridStore((state) => state.cellHeight);
  const isMobile = useGridStore((state) => state.isMobile);

  // 아이템 선택 상태
  const selectedItemId = useSectionStore((state) => state.selectedItemId);
  const setSelectedItemId = useSectionStore((state) => state.setSelectedItemId);

  // 텍스트 편집 상태
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");

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
        const isSelected = selectedItemId === item.id;

        return (
          <Rnd
            key={item.id}
            position={{
              x: currentItem.x * (cellWidth + GAP),
              y: currentItem.y * (cellHeight + GAP),
            }}
            size={{
              width:
                currentItem.width * cellWidth + (currentItem.width - 1) * GAP,
              height:
                currentItem.height * cellHeight +
                (currentItem.height - 1) * GAP,
            }}
            onDragStart={() => {
              setSelectedItemId(item.id);
              onToggleGridVisibility(sectionId, true);
            }}
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

              const newWidth = Math.round(ref.offsetWidth / (cellWidth + GAP));
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
            onClick={() => setSelectedItemId(item.id)}
            dragGrid={[cellWidth + GAP, cellHeight + GAP]}
            resizeGrid={[cellWidth + GAP, cellHeight + GAP]}
            bounds="parent"
            className="absolute"
            enableUserSelectHack={false}
          >
            <div className="relative w-full h-full">
              {/* 선택 표시 (조금 더 큰 사각형) */}
              {isSelected && (
                <div
                  className="absolute border-1 border-dashed border-blue-500 rounded-md pointer-events-none transition-all"
                  style={{
                    inset: "-6px",
                    boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.3)",
                  }}
                />
              )}
              {item.type === "button" ? (
                <button className="w-full h-full bg-blue-500 hover:bg-blue-600 text-white rounded-md cursor-move flex items-center justify-center text-sm font-semibold shadow-md hover:shadow-lg transition-all border border-blue-600">
                  Button
                </button>
              ) : item.type === "text" ? (
                editingItemId === item.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={() => {
                      onItemContentUpdate?.(sectionId, item.id, editingText);
                      setEditingItemId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onItemContentUpdate?.(sectionId, item.id, editingText);
                        setEditingItemId(null);
                      }
                    }}
                    className="flex items-center text-center w-full h-full bg-transparent text-gray-700 text-sm font-normal focus:outline-none"
                  />
                ) : (
                  <div
                    onClick={() => {
                      setEditingItemId(item.id);
                      setEditingText(item.content || "");
                    }}
                    className="flex justify-center items-center text-center cursor-text text-gray-700 text-sm font-normal h-full"
                  >
                    {item.content || "클릭해서 입력"}
                  </div>
                )
              ) : (
                <div className="w-full h-full bg-white rounded-md cursor-move flex items-center justify-center text-gray-400 text-sm font-medium shadow-md hover:shadow-lg transition-shadow border border-gray-200"></div>
              )}
            </div>
          </Rnd>
        );
      })}
    </>
  );
}
