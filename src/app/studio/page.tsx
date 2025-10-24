"use client";

import React from "react";
import Canvas from "@/components/Canvas";
import LeftNavigationBar from "@/layouts/LeftNavigationBar";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useGridDimensions } from "@/hooks/useGridDimensions";
import { useLayoutStore } from "@/store/useLayoutStore";
import { AddableItemType } from "@/types/item";
import RightNavBar from "@/layouts/RightNavigationBar";
import { usePageStore } from "@/store/usePageStore";

export default function StudioPage() {
  // 반응형 그리드 크기 계산
  const { gridRef } = useGridDimensions();

  // LayoutStore에서 그리드 정보 구독
  const { cellWidth, cellHeight, gridCols, isMobile } = useLayoutStore();

  // 페이지 상태 관리
  const {
    sections,
    selectedSectionId,
    selectedItemId,
    gridVisibleSectionId,
    addSection,
    updateSection,
    addItem,
    deleteItem,
    updateItem,
    savePage,
    showGrid,
    hideGrid,
    setResizingSectionId,
  } = usePageStore();

  // LNB에서 아이템 추가 헬퍼 함수
  const handleAddItem = (type: AddableItemType) => {
    addItem(selectedSectionId, type, 0, 0);
  };

  // 드래그 앤 드롭 훅
  const {
    dragPreview,
    handleLNBDragStart,
    handleSectionDragOver,
    handleSectionDragLeave,
    handleSectionDrop,
  } = useDragAndDrop({
    cellWidth,
    cellHeight,
    gridCols,
    addItem,
    sections,
    onShowGrid: showGrid,
    onHideGrid: hideGrid,
  });

  // 도형 드래그 시작 핸들러
  const handleShapeDragStart = (sectionId: string) => {
    showGrid(sectionId);
  };

  // 도형 드래그 종료 핸들러
  const handleShapeDragEnd = (
    sectionId: string,
    itemId: string,
    newX: number,
    newY: number
  ) => {
    hideGrid();

    updateItem(sectionId, itemId, (item) => ({
      ...item,
      style: {
        ...item.style,
        [isMobile ? "mobile" : "desktop"]: {
          ...(isMobile ? item.style.mobile : item.style.desktop),
          position: {
            x: Math.max(0, Math.min(gridCols - 1, newX)),
            y: Math.max(
              0,
              Math.min(
                sections.find((s) => s.id === sectionId)?.height || 24,
                newY
              )
            ),
          },
        },
      },
    }));
  };

  // 아이템 드래그 종료 핸들러
  const handleItemDragStop = (
    sectionId: string,
    itemId: string,
    newCol: number,
    newRow: number
  ) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    updateItem(sectionId, itemId, (item) => ({
      ...item,
      style: {
        ...item.style,
        [isMobile ? "mobile" : "desktop"]: {
          ...(isMobile ? item.style.mobile : item.style.desktop),
          position: {
            x: Math.max(0, Math.min(gridCols - 1, newCol)),
            y: Math.max(0, Math.min(section.height - 1, newRow)),
          },
        },
      },
    }));
  };

  // 아이템 리사이즈 종료 핸들러
  const handleItemResizeStop = (
    sectionId: string,
    itemId: string,
    newCol: number,
    newRow: number,
    newWidth: number,
    newHeight: number
  ) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const clampedX = Math.max(0, Math.min(gridCols - 1, newCol));
    const clampedY = Math.max(0, Math.min(section.height - 1, newRow));
    const clampedWidth = Math.max(1, Math.min(gridCols - newCol, newWidth));
    const clampedHeight = Math.max(
      1,
      Math.min(section.height - newRow, newHeight)
    );

    updateItem(sectionId, itemId, (item) => ({
      ...item,
      style: {
        ...item.style,
        [isMobile ? "mobile" : "desktop"]: {
          position: { x: clampedX, y: clampedY },
          width: clampedWidth,
          height: clampedHeight,
        },
      },
    }));
  };

  // 섹션 리사이즈 핸들러
  const handleSectionResizeStart = (
    sectionId: string,
    sectionHeight: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    setResizingSectionId(sectionId);

    const resizeStartY = e.clientY;
    const resizeStartHeight = sectionHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - resizeStartY;
      const rowHeight = cellHeight + 4; // GAP === 4;
      const deltaRows = Math.round(deltaY / rowHeight);
      const newHeight = Math.max(12, resizeStartHeight + deltaRows);

      updateSection(sectionId, (section) => ({
        ...section,
        height: newHeight,
      }));
    };

    const handleMouseUp = () => {
      setResizingSectionId(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <main className="flex pb-10 h-[calc(100vh-40px)]">
        {/* LNB */}
        <LeftNavigationBar
          addItem={handleAddItem}
          onDragStart={handleLNBDragStart}
        />

        {/* Canvas */}
        <Canvas
          sections={sections}
          gridVisibleSectionId={gridVisibleSectionId}
          dragPreview={dragPreview}
          gridRef={gridRef}
          onBackgroundColorChange={(sectionId, color) =>
            updateSection(sectionId, (section) => ({
              ...section,
              backgroundColor: color,
            }))
          }
          onSectionDragOver={handleSectionDragOver}
          onSectionDragLeave={handleSectionDragLeave}
          onSectionDrop={handleSectionDrop}
          onShapeDragStart={handleShapeDragStart}
          onShapeDragEnd={handleShapeDragEnd}
          onToggleGridVisibility={(sectionId, visible) =>
            visible ? showGrid(sectionId) : hideGrid()
          }
          onItemDragStop={handleItemDragStop}
          onItemResizeStop={handleItemResizeStop}
          onItemContentUpdate={(sectionId, itemId, content) =>
            updateItem(sectionId, itemId, (item) => ({
              ...item,
              content,
            }))
          }
          onSectionResizeStart={handleSectionResizeStart}
        />

        {/* RNB */}
        <RightNavBar />
      </main>

      {/* Floating 버튼들 */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 p-4 rounded-2xl bg-white shadow-2xl border border-slate-200 backdrop-blur-sm items-center *:shrink-0">
        <button
          onClick={addSection}
          className="px-4 py-2.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
          title="섹션 추가"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          section
        </button>
        <div className="w-px bg-slate-200"></div>
        <button
          onClick={savePage}
          className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center active:scale-95 shrink-0"
          title="페이지 저장"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
        </button>
        {selectedItemId && (
          <button
            onClick={() => deleteItem(selectedSectionId, selectedItemId)}
            className="size-10 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 py-3 border-2 border-red-600 font-medium"
            title="선택된 아이템 삭제"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
