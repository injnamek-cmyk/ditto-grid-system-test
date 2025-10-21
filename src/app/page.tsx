"use client";

import { useEffect } from "react";
import Canvas from "@/components/Canvas";
import Header from "@/layouts/Header";
import LeftNavigationBar from "@/layouts/LeftNavigationBar";
import { usePageState } from "@/hooks/usePageState";
import { useSectionResize } from "@/hooks/useSectionResize";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useGridVisibility } from "@/hooks/useGridVisibility";
import { useGridDimensions } from "@/hooks/useGridDimensions";
import { useGridStore } from "@/store/useGridStore";
import { useSectionStore } from "@/store/useSectionStore";

export default function Home() {
  // 반응형 그리드 크기 계산
  const {
    cellWidth,
    cellHeight,
    gridCols,
    isMobile,
    gridRef,
  } = useGridDimensions();

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
  } = usePageState();

  // Zustand 스토어
  const setGridDimensions = useGridStore((state) => state.setGridDimensions);
  const selectedSectionId = useSectionStore((state) => state.selectedSectionId);
  const setSelectedSectionId = useSectionStore(
    (state) => state.setSelectedSectionId
  );

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
  const {
    gridVisibleSectionId,
    toggleGridVisibility,
    showGrid,
    hideGrid,
  } = useGridVisibility();

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
  const addBox = () => {
    addItemAtPosition(selectedSectionId, "box", 0, 0);
  };

  const addButton = () => {
    addItemAtPosition(selectedSectionId, "button", 0, 0);
  };

  const addText = () => {
    addItemAtPosition(selectedSectionId, "text", 0, 0);
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
    <div className="min-h-screen relative">
      <Header savePage={savePage} />
      <main className="flex pb-10">
        {/* LNB */}
        <LeftNavigationBar
          onAddBox={addBox}
          onAddButton={addButton}
          onAddText={addText}
          onDragStart={handleLNBDragStart}
        />

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
        <div className="w-[200px] bg-white border-l border-gray-200"></div>
      </main>

      {/* Floating 버튼들 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        <button
          onClick={addSection}
          className="px-4 py-2 bg-white text-gray-700 font-bold rounded-md shadow-lg hover:shadow-xl transition-all flex items-center justify-center border border-gray-200"
          title="섹션 추가"
        >
          + section
        </button>
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
