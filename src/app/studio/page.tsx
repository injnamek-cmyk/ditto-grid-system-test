"use client";

import { useEffect } from "react";
import Canvas from "@/components/Canvas";
import LeftNavigationBar from "@/layouts/LeftNavigationBar";
import { usePageState } from "@/hooks/usePageState";
import { useSectionResize } from "@/hooks/useSectionResize";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useGridVisibility } from "@/hooks/useGridVisibility";
import { useGridDimensions } from "@/hooks/useGridDimensions";
import { useGridStore } from "@/store/useGridStore";
import { useSectionStore } from "@/store/useSectionStore";
import { AddableItemType } from "@/types/item";

export default function StudioPage() {
  // 반응형 그리드 크기 계산
  const { cellWidth, cellHeight, gridCols, isMobile, gridRef } =
    useGridDimensions();

  // 페이지 상태 관리
  const {
    sections,
    selectedSectionId: pageSelectedSectionId,
    addSection,
    changeSectionBackgroundColor,
    updateItemPosition,
    updateItemSize,
    addItemAtPosition,
    updateSectionHeight,
    updateItemContent,
    savePage,
    deleteItem,
  } = usePageState();

  // Zustand 스토어
  const setGridDimensions = useGridStore((state) => state.setGridDimensions);
  const selectedSectionId = useSectionStore((state) => state.selectedSectionId);
  const setSelectedSectionId = useSectionStore(
    (state) => state.setSelectedSectionId
  );
  const selectedItemId = useSectionStore((state) => state.selectedItemId);

  // 그리드 크기 변경 시 스토어 업데이트
  useEffect(() => {
    setGridDimensions(cellWidth, cellHeight, gridCols, isMobile);
  }, [cellWidth, cellHeight, gridCols, isMobile, setGridDimensions]);

  // 페이지 상태의 선택된 섹션이 변경되면 스토어에도 반영
  useEffect(() => {
    if (pageSelectedSectionId) {
      setSelectedSectionId(pageSelectedSectionId);
    }
  }, [pageSelectedSectionId, setSelectedSectionId]);

  // 그리드 가시성 관리
  const { gridVisibleSectionId, toggleGridVisibility, showGrid, hideGrid } =
    useGridVisibility();

  // 섹션 리사이즈 훅
  const {
    resizingSectionId,
    handleResizeStart,
    updateSectionHeight: triggerResize,
  } = useSectionResize(cellHeight);

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
    addItemAtPosition,
    sections,
    onShowGrid: showGrid,
    onHideGrid: hideGrid,
  });

  // LNB에서 아이템 추가 헬퍼 함수
  const addItem = (type: AddableItemType) => {
    addItemAtPosition(selectedSectionId, type, 0, 0);
  };

  // 도형 드래그 시작 핸들러
  const handleShapeDragStart = (sectionId: string) => {
    toggleGridVisibility(sectionId, true);
  };

  // 도형 드래그 종료 핸들러
  const handleShapeDragEnd = (
    sectionId: string,
    itemId: string,
    newX: number,
    newY: number
  ) => {
    toggleGridVisibility(sectionId, false);

    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      updateItemPosition(
        sectionId,
        itemId,
        newX,
        newY,
        section.height,
        isMobile,
        gridCols
      );
    }
  };

  // 아이템 드래그 종료 핸들러
  const handleItemDragStop = (
    sectionId: string,
    itemId: string,
    newCol: number,
    newRow: number
  ) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      updateItemPosition(
        sectionId,
        itemId,
        newCol,
        newRow,
        section.height,
        isMobile,
        gridCols
      );
    }
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
    if (section) {
      updateItemSize(
        sectionId,
        itemId,
        newCol,
        newRow,
        newWidth,
        newHeight,
        section.height,
        isMobile,
        gridCols
      );
    }
  };

  // 섹션 리사이즈 useEffect
  useEffect(() => {
    if (resizingSectionId === null) return;

    const cleanup = triggerResize((newHeight) => {
      updateSectionHeight(resizingSectionId, newHeight);
    });

    return cleanup;
  }, [resizingSectionId, triggerResize, updateSectionHeight]);

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <main className="flex pb-10 h-[calc(100vh-40px)]">
        {/* LNB */}
        <LeftNavigationBar addItem={addItem} onDragStart={handleLNBDragStart} />

        {/* Canvas */}
        <Canvas
          sections={sections}
          gridVisibleSectionId={gridVisibleSectionId}
          dragPreview={dragPreview}
          gridRef={gridRef}
          onBackgroundColorChange={changeSectionBackgroundColor}
          onSectionDragOver={handleSectionDragOver}
          onSectionDragLeave={handleSectionDragLeave}
          onSectionDrop={handleSectionDrop}
          onShapeDragStart={handleShapeDragStart}
          onShapeDragEnd={handleShapeDragEnd}
          onToggleGridVisibility={toggleGridVisibility}
          onItemDragStop={handleItemDragStop}
          onItemResizeStop={handleItemResizeStop}
          onItemContentUpdate={updateItemContent}
          onSectionResizeStart={handleResizeStart}
        />

        {/* RNB */}
        <div className="w-[200px] bg-white border-l border-slate-200 shadow-sm"></div>
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
        {/* 도형 추가 버튼들 */}
        {/* <button
          onClick={() => addShape("circle")}
          className="w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center border-2 border-blue-600"
          title="동그라미 추가"
        >
          ●
        </button>
        <button
          onClick={() => addShape("triangle")}
          className="w-12 h-12 bg-green-500 text-white shadow-lg hover:shadow-xl hover:bg-green-600 transition-all flex items-center justify-center border-2 border-green-600"
          title="삼각형 추가"
          style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        ></button>
        <button
          onClick={() => addShape("rectangle")}
          className="w-12 h-12 bg-purple-500 text-white rounded-md shadow-lg hover:shadow-xl hover:bg-purple-600 transition-all flex items-center justify-center border-2 border-purple-600"
          title="사각형 추가"
        >
          ▪
        </button> */}
      </div>
    </div>
  );
}
