"use client";

import { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { v4 as uuidv4 } from "uuid";

type Section = {
  id: string;
  height: number; // 행 개수
};

type Item = {
  id: string;
  sectionId: string;
  desktop: { x: number; y: number; width: number; height: number };
  mobile: { x: number; y: number; width: number; height: number };
};

type Page = {
  id: string;
  sections: Section[];
  items: Item[];
  createdAt: string;
  updatedAt: string;
};

export default function Home() {
  const gridRef = useRef<HTMLDivElement>(null);

  // 고정된 셀 크기 (1080px / 24 rows = 45px per row, gap 8px 고려)
  const CELL_HEIGHT = (1080 - 8 * 23) / 24; // ≈ 37.67px
  const GAP = 8;

  const [cellWidth, setCellWidth] = useState(0);

  // 초기 ID 생성
  const initialSectionId = useRef(uuidv4());
  const initialItemId = useRef(uuidv4());

  // 섹션 관리
  const [sections, setSections] = useState<Section[]>([
    { id: initialSectionId.current, height: 24 },
  ]);

  // 아이템 관리
  const [items, setItems] = useState<Item[]>([
    {
      id: initialItemId.current,
      sectionId: initialSectionId.current,
      desktop: { x: 0, y: 0, width: 1, height: 1 },
      mobile: { x: 0, y: 0, width: 1, height: 1 },
    },
  ]);

  // 반응형 그리드 컬럼 수 설정
  const [gridCols, setGridCols] = useState(24);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // 선택된 섹션 관리
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    initialSectionId.current
  );

  // 섹션 리사이즈 상태
  const [resizingSectionId, setResizingSectionId] = useState<string | null>(
    null
  );
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeStartHeight, setResizeStartHeight] = useState(0);

  // 섹션 추가 함수
  const addSection = () => {
    const newSection: Section = {
      id: uuidv4(),
      height: 24,
    };
    setSections([...sections, newSection]);
  };

  // 아이템 추가 함수 (선택된 섹션에 추가)
  const addItem = () => {
    const newItem: Item = {
      id: uuidv4(),
      sectionId: selectedSectionId,
      desktop: { x: 0, y: 0, width: 2, height: 2 },
      mobile: { x: 0, y: 0, width: 2, height: 2 },
    };
    setItems([...items, newItem]);
  };

  // 페이지 저장 함수
  const savePage = () => {
    const page: Page = {
      id: uuidv4(),
      sections,
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 로컬 스토리지에 저장
    localStorage.setItem("gridPage", JSON.stringify(page));
    alert("페이지가 저장되었습니다!");
  };

  // 섹션 리사이즈 핸들러
  const handleResizeStart = (
    sectionId: string,
    section: Section,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    setResizingSectionId(sectionId);
    setResizeStartY(e.clientY);
    setResizeStartHeight(section.height);
  };

  useEffect(() => {
    if (resizingSectionId === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - resizeStartY;
      const rowHeight = CELL_HEIGHT + GAP;
      const deltaRows = Math.round(deltaY / rowHeight);
      const newHeight = Math.max(12, resizeStartHeight + deltaRows); // 최소 12행

      setSections(
        sections.map((s) =>
          s.id === resizingSectionId ? { ...s, height: newHeight } : s
        )
      );
    };

    const handleMouseUp = () => {
      setResizingSectionId(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    resizingSectionId,
    resizeStartY,
    resizeStartHeight,
    CELL_HEIGHT,
    GAP,
    sections,
  ]);

  // 앱 시작 시 로컬 스토리지에서 페이지 데이터 불러오기
  useEffect(() => {
    const savedPage = localStorage.getItem("gridPage");
    if (savedPage) {
      try {
        const page: Page = JSON.parse(savedPage);
        setSections(page.sections);
        setItems(page.items);
        if (page.sections.length > 0) {
          setSelectedSectionId(page.sections[0].id);
        }
      } catch (error) {
        console.error("페이지 데이터 불러오기 실패:", error);
      }
    }
  }, []);

  // 셀 너비 계산 (높이는 고정)
  useEffect(() => {
    const updateCellWidth = () => {
      if (gridRef.current) {
        // 화면 너비에 따라 컬럼 수 조정
        const width = window.innerWidth;
        const cols = width < 768 ? 12 : 24; // 모바일: 12, 데스크톱: 24
        const mobile = width < 768;

        setGridCols(cols);
        setIsMobile(mobile);

        // 실제 그리드 셀 하나의 크기를 측정
        const firstCell = gridRef.current.querySelector(
          '[data-row="0"][data-col="0"]'
        ) as HTMLElement;
        if (firstCell) {
          const calculatedCellWidth = firstCell.offsetWidth;
          setCellWidth(calculatedCellWidth);
        }
      }
    };

    // 초기 로드와 리사이즈 시 약간의 지연을 두고 측정 (DOM이 완전히 렌더링된 후)
    updateCellWidth();
    setTimeout(updateCellWidth, 100);

    window.addEventListener("resize", updateCellWidth);
    return () => window.removeEventListener("resize", updateCellWidth);
  }, []);

  return (
    <div className="max-w-[1920px] mx-auto min-h-screen p-4 bg-gray-50 relative">
      {sections.map((section, sectionIndex) => {
        // 각 섹션별 그리드 셀 생성
        const sectionGridCells = Array.from(
          { length: gridCols * section.height },
          (_, index) => {
            const row = Math.floor(index / gridCols);
            const col = index % gridCols;
            return { row, col, id: `section-${section.id}-cell-${row}-${col}` };
          }
        );

        // 이 섹션에 속한 아이템들
        const sectionItems = items.filter(
          (item) => item.sectionId === section.id
        );

        const isSelected = section.id === selectedSectionId;

        return (
          <div key={section.id} className="py-2">
            <div
              className="relative cursor-pointer transition-all group"
              onClick={() => setSelectedSectionId(section.id)}
            >
              {/* 선택 버튼 오버레이 (선택되지 않은 섹션에만 표시) */}
              {!isSelected && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  <button
                    className="px-6 py-3 bg-white text-black rounded-lg shadow-lg pointer-events-auto font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSectionId(section.id);
                    }}
                  >
                    섹션 선택하기
                  </button>
                </div>
              )}

              {/* 호버 시 어두운 배경 (선택되지 않은 섹션) */}
              {!isSelected && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-lg pointer-events-none"></div>
              )}

              <div
                ref={sectionIndex === 0 ? gridRef : null}
                className={`w-full grid grid-cols-12 md:grid-cols-24 gap-2 transition-all ${
                  isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
                }`}
                style={{
                  gridTemplateRows: `repeat(${section.height}, ${CELL_HEIGHT}px)`,
                  height: `${
                    section.height * CELL_HEIGHT + (section.height - 1) * GAP
                  }px`,
                }}
              >
                {/* 그리드 셀 */}
                {sectionGridCells.map((cell) => (
                  <div
                    key={cell.id}
                    className={`transition-all duration-200 ${
                      isVisible ? "bg-slate-200/40" : "bg-transparent"
                    }`}
                    data-row={cell.row}
                    data-col={cell.col}
                  />
                ))}

                {/* 섹션 내 아이템들 */}
                {cellWidth > 0 &&
                  sectionItems.map((item) => {
                    const currentItem = isMobile ? item.mobile : item.desktop;

                    return (
                      <Rnd
                        key={item.id}
                        position={{
                          x: currentItem.x * (cellWidth + GAP),
                          y: currentItem.y * (CELL_HEIGHT + GAP),
                        }}
                        size={{
                          width:
                            currentItem.width * cellWidth +
                            (currentItem.width - 1) * GAP,
                          height:
                            currentItem.height * CELL_HEIGHT +
                            (currentItem.height - 1) * GAP,
                        }}
                        onDragStart={() => setIsVisible(true)}
                        onDrag={() => {
                          if (!isVisible) setIsVisible(true);
                        }}
                        onDragStop={(_, d) => {
                          setIsVisible(false);
                          const newCol = Math.round(d.x / (cellWidth + GAP));
                          const newRow = Math.round(d.y / (CELL_HEIGHT + GAP));

                          setItems(
                            items.map((i) => {
                              if (i.id !== item.id) return i;

                              if (isMobile) {
                                return {
                                  ...i,
                                  mobile: {
                                    ...i.mobile,
                                    x: Math.max(
                                      0,
                                      Math.min(gridCols - 1, newCol)
                                    ),
                                    y: Math.max(
                                      0,
                                      Math.min(gridCols - 1, newRow)
                                    ),
                                  },
                                };
                              } else {
                                return {
                                  ...i,
                                  desktop: {
                                    ...i.desktop,
                                    x: Math.max(
                                      0,
                                      Math.min(gridCols - 1, newCol)
                                    ),
                                    y: Math.max(
                                      0,
                                      Math.min(gridCols - 1, newRow)
                                    ),
                                  },
                                };
                              }
                            })
                          );
                        }}
                        onResizeStart={() => setIsVisible(true)}
                        onResize={() => {
                          if (!isVisible) setIsVisible(true);
                        }}
                        onResizeStop={(_, __, ref, ___, position) => {
                          setIsVisible(false);
                          const newWidth = Math.round(
                            ref.offsetWidth / (cellWidth + GAP)
                          );
                          const newHeight = Math.round(
                            ref.offsetHeight / (CELL_HEIGHT + GAP)
                          );
                          const newCol = Math.round(
                            position.x / (cellWidth + GAP)
                          );
                          const newRow = Math.round(
                            position.y / (CELL_HEIGHT + GAP)
                          );

                          setItems(
                            items.map((i) => {
                              if (i.id !== item.id) return i;

                              if (isMobile) {
                                return {
                                  ...i,
                                  mobile: {
                                    x: Math.max(
                                      0,
                                      Math.min(gridCols - 1, newCol)
                                    ),
                                    y: Math.max(
                                      0,
                                      Math.min(gridCols - 1, newRow)
                                    ),
                                    width: Math.max(
                                      1,
                                      Math.min(gridCols - newCol, newWidth)
                                    ),
                                    height: Math.max(
                                      1,
                                      Math.min(gridCols - newRow, newHeight)
                                    ),
                                  },
                                };
                              } else {
                                return {
                                  ...i,
                                  desktop: {
                                    x: Math.max(
                                      0,
                                      Math.min(gridCols - 1, newCol)
                                    ),
                                    y: Math.max(
                                      0,
                                      Math.min(gridCols - 1, newRow)
                                    ),
                                    width: Math.max(
                                      1,
                                      Math.min(gridCols - newCol, newWidth)
                                    ),
                                    height: Math.max(
                                      1,
                                      Math.min(gridCols - newRow, newHeight)
                                    ),
                                  },
                                };
                              }
                            })
                          );
                        }}
                        dragGrid={[cellWidth + GAP, CELL_HEIGHT + GAP]}
                        resizeGrid={[cellWidth + GAP, CELL_HEIGHT + GAP]}
                        bounds="parent"
                        className="absolute"
                      >
                        <div className="w-full h-full bg-white rounded-md cursor-move flex items-center justify-center text-gray-400 text-sm font-medium shadow-md hover:shadow-lg transition-shadow border border-gray-200"></div>
                      </Rnd>
                    );
                  })}
              </div>

              {/* 섹션 리사이즈 핸들 */}
              <div
                className="h-px border-t border-dashed border-gray-400 hover:border-blue-500 cursor-ns-resize transition-colors mt-4"
                onMouseDown={(e) => handleResizeStart(section.id, section, e)}
              ></div>
            </div>
          </div>
        );
      })}

      {/* Floating 버튼들 */}
      <div className="fixed bottom-6 right-6 flex gap-3">
        <button
          onClick={savePage}
          className="w-12 h-12 bg-white text-gray-700 rounded-md shadow-lg hover:shadow-xl transition-all flex items-center justify-center border border-gray-200"
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
        <button
          onClick={addSection}
          className="w-12 h-12 bg-white text-gray-700 rounded-md shadow-lg hover:shadow-xl transition-all flex items-center justify-center border border-gray-200"
          title="섹션 추가"
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
              d="M12 4v16m8-8H4"
            />
            <rect
              x="4"
              y="6"
              width="16"
              height="12"
              rx="2"
              strokeWidth={2}
              fill="none"
            />
          </svg>
        </button>
        <button
          onClick={addItem}
          className="w-12 h-12 bg-white text-gray-700 rounded-md shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-2xl font-light border border-gray-200"
          title="아이템 추가"
        >
          +
        </button>
      </div>
    </div>
  );
}
