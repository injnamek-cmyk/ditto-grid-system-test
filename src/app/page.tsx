"use client";

import { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { v4 as uuidv4 } from "uuid";
import PixiCanvas from "@/components/PixiCanvas";
import { Item, ShapeItem } from "@/types/item";

type Section = {
  id: string;
  height: number; // 행 개수
  backgroundColor: string; // 배경색
  isGridVisible: boolean; // 그리드 가시성
  items: Item[]; // 이 섹션에 속한 아이템들
};

type Page = {
  id: string;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
};

export default function Home() {
  const gridRef = useRef<HTMLDivElement>(null);

  // 셀 비율 및 간격
  const CELL_ASPECT_RATIO = 1.6; // 가로:세로 = 1.6:1
  const GAP = 8;

  const [cellWidth, setCellWidth] = useState(0);
  const [cellHeight, setCellHeight] = useState(0);

  // 초기 ID 생성
  const initialSectionId = useRef(uuidv4());
  const initialItemId = useRef(uuidv4());

  // 섹션 관리 (items도 포함)
  const [sections, setSections] = useState<Section[]>([
    {
      id: initialSectionId.current,
      height: 24,
      backgroundColor: "#ffffff",
      isGridVisible: false,
      items: [
        {
          id: initialItemId.current,
          desktop: { x: 0, y: 0, width: 1, height: 1 },
          mobile: { x: 0, y: 0, width: 1, height: 1 },
        },
      ],
    },
  ]);

  // 반응형 그리드 컬럼 수 설정
  const [gridCols, setGridCols] = useState(24);
  const [isMobile, setIsMobile] = useState(false);

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
      backgroundColor: "#ffffff",
      isGridVisible: false,
      items: [],
    };
    setSections([...sections, newSection]);
  };

  // 아이템 추가 함수 (선택된 섹션에 추가)
  const addItem = () => {
    const newItem: Item = {
      id: uuidv4(),
      desktop: { x: 0, y: 0, width: 2, height: 2 },
      mobile: { x: 0, y: 0, width: 2, height: 2 },
    };
    setSections((prevSections) =>
      prevSections.map((s) =>
        s.id === selectedSectionId ? { ...s, items: [...s.items, newItem] } : s
      )
    );
  };

  // 도형 추가 함수
  const addShape = (shapeType: "circle" | "triangle" | "rectangle") => {
    const newShape: Item = {
      id: uuidv4(),
      type: shapeType,
      color: "#3b82f6", // 파란색 기본값
      desktop: { x: 0, y: 0, width: 3, height: 3 },
      mobile: { x: 0, y: 0, width: 3, height: 3 },
    };
    setSections((prevSections) =>
      prevSections.map((s) =>
        s.id === selectedSectionId ? { ...s, items: [...s.items, newShape] } : s
      )
    );
  };

  // 버튼 추가 함수
  const addButton = () => {
    const newButton: Item = {
      id: uuidv4(),
      type: "button",
      desktop: { x: 0, y: 0, width: 3, height: 2 },
      mobile: { x: 0, y: 0, width: 2, height: 1 },
    };
    setSections((prevSections) =>
      prevSections.map((s) =>
        s.id === selectedSectionId
          ? { ...s, items: [...s.items, newButton] }
          : s
      )
    );
  };

  // 텍스트 추가 함수
  const addText = () => {
    const newText: Item = {
      id: uuidv4(),
      type: "text",
      desktop: { x: 0, y: 0, width: 2, height: 1 },
      mobile: { x: 0, y: 0, width: 2, height: 1 },
    };
    setSections((prevSections) =>
      prevSections.map((s) =>
        s.id === selectedSectionId
          ? { ...s, items: [...s.items, newText] }
          : s
      )
    );
  };

  // 그리드 가시성 토글 헬퍼
  const toggleGridVisibility = (sectionId: string, visible: boolean) => {
    setSections((prevSections) =>
      prevSections.map((s) =>
        s.id === sectionId ? { ...s, isGridVisible: visible } : s
      )
    );
  };

  // 섹션 배경색 변경 함수
  const changeSectionBackgroundColor = (sectionId: string, color: string) => {
    setSections((prevSections) =>
      prevSections.map((s) =>
        s.id === sectionId ? { ...s, backgroundColor: color } : s
      )
    );
  };

  // 아이템 위치 업데이트 헬퍼
  const updateItemPosition = (
    sectionId: string,
    itemId: string,
    newX: number,
    newY: number,
    sectionHeight: number
  ) => {
    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.id !== sectionId) return section;

        return {
          ...section,
          items: section.items.map((i) => {
            if (i.id !== itemId) return i;

            const clampedX = Math.max(0, Math.min(gridCols - 1, newX));
            const clampedY = Math.max(0, Math.min(sectionHeight - 1, newY));

            if (isMobile) {
              return {
                ...i,
                mobile: { ...i.mobile, x: clampedX, y: clampedY },
              };
            } else {
              return {
                ...i,
                desktop: { ...i.desktop, x: clampedX, y: clampedY },
              };
            }
          }),
        };
      })
    );
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
      updateItemPosition(sectionId, itemId, newX, newY, section.height);
    }
  };

  // 페이지 저장 함수
  const savePage = () => {
    const page: Page = {
      id: uuidv4(),
      sections,
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
      const rowHeight = cellHeight + GAP;
      const deltaRows = Math.round(deltaY / rowHeight);
      const newHeight = Math.max(12, resizeStartHeight + deltaRows); // 최소 12행

      setSections((prevSections) =>
        prevSections.map((s) =>
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
  }, [resizingSectionId, resizeStartY, resizeStartHeight, cellHeight, GAP]);

  // 앱 시작 시 로컬 스토리지에서 페이지 데이터 불러오기
  useEffect(() => {
    const savedPage = localStorage.getItem("gridPage");
    if (savedPage) {
      try {
        const page: Page = JSON.parse(savedPage);
        setSections(page.sections);
        if (page.sections.length > 0) {
          setSelectedSectionId(page.sections[0].id);
        }
      } catch (error) {
        console.error("페이지 데이터 불러오기 실패:", error);
      }
    }
  }, []);

  // 셀 너비와 높이 계산 (비율 1.6:1 유지)
  useEffect(() => {
    const updateCellSize = () => {
      if (gridRef.current) {
        // 화면 너비에 따라 컬럼 수 조정
        const width = window.innerWidth;
        const cols = width < 768 ? 12 : 24; // 모바일: 12, 데스크톱: 24
        const mobile = width < 768;

        setGridCols(cols);
        setIsMobile(mobile);

        // CSS Grid가 실제로 렌더링한 셀 크기를 측정
        const firstCell = gridRef.current.querySelector(
          '[data-row="0"][data-col="0"]'
        ) as HTMLElement;
        if (firstCell) {
          // getBoundingClientRect()로 브라우저가 최종 계산한 실제 셀 너비를 가져옴
          const rect = firstCell.getBoundingClientRect();
          const calculatedCellWidth = rect.width;
          // 비율을 유지하여 높이 계산
          const calculatedCellHeight = calculatedCellWidth / CELL_ASPECT_RATIO;

          setCellWidth(calculatedCellWidth);
          setCellHeight(calculatedCellHeight);
        }
      }
    };

    // ResizeObserver로 그리드가 실제로 리사이즈될 때마다 측정
    let resizeObserver: ResizeObserver | null = null;

    if (gridRef.current) {
      resizeObserver = new ResizeObserver(() => {
        // requestAnimationFrame으로 브라우저가 레이아웃 계산을 마친 후 측정
        requestAnimationFrame(updateCellSize);
      });
      resizeObserver.observe(gridRef.current);
    }

    // 초기 측정
    updateCellSize();

    // window resize도 감지 (ResizeObserver의 백업)
    window.addEventListener("resize", updateCellSize);

    return () => {
      window.removeEventListener("resize", updateCellSize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [CELL_ASPECT_RATIO]);

  return (
    <div className="min-h-screen relative">
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

        // 이 섹션에 속한 아이템들 (section.items 직접 사용)
        const sectionItems = section.items;

        const isSelected = section.id === selectedSectionId;

        return (
          <div
            key={section.id}
            className={`w-full py-2 relative cursor-pointer transition-all group`}
            style={{ backgroundColor: section.backgroundColor }}
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
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 pointer-events-none"></div>
            )}

            <div className="max-w-[1920px] mx-auto px-4">
              {/* 선택된 섹션에 컬러 피커 표시 */}
              {isSelected && (
                <div className="mb-4 flex items-center gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
                  <label className="text-sm font-medium text-gray-700">
                    배경색:
                  </label>
                  <input
                    type="color"
                    value={section.backgroundColor}
                    onChange={(e) =>
                      changeSectionBackgroundColor(section.id, e.target.value)
                    }
                    className="w-12 h-8 rounded cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={section.backgroundColor}
                    onChange={(e) =>
                      changeSectionBackgroundColor(section.id, e.target.value)
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
                  {sectionGridCells.map((cell) => (
                    <div
                      key={cell.id}
                      className={`transition-all duration-200 ${
                        section.isGridVisible
                          ? "bg-slate-200/40"
                          : "bg-transparent"
                      }`}
                      data-row={cell.row}
                      data-col={cell.col}
                    />
                  ))}

                  {/* Pixi.js 도형 캔버스 */}
                  {cellWidth > 0 && (
                    <PixiCanvas
                      sectionId={section.id}
                      items={sectionItems.filter(
                        (item): item is ShapeItem =>
                          item.type === "circle" ||
                          item.type === "triangle" ||
                          item.type === "rectangle"
                      )}
                      cellWidth={cellWidth}
                      cellHeight={cellHeight}
                      gap={GAP}
                      gridCols={gridCols}
                      sectionHeight={section.height}
                      isMobile={isMobile}
                      onShapeDragStart={() => handleShapeDragStart(section.id)}
                      onShapeDragEnd={(itemId, newX, newY) =>
                        handleShapeDragEnd(section.id, itemId, newX, newY)
                      }
                    />
                  )}

                  {/* 섹션 내 아이템들 (도형 제외) */}
                  {cellWidth > 0 &&
                    sectionItems
                      .filter(
                        (item) =>
                          item.type !== "circle" &&
                          item.type !== "triangle" &&
                          item.type !== "rectangle"
                      )
                      .map((item) => {
                        const currentItem = isMobile
                          ? item.mobile
                          : item.desktop;

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
                            onDragStart={() =>
                              toggleGridVisibility(section.id, true)
                            }
                            onDrag={() => {
                              if (!section.isGridVisible) {
                                toggleGridVisibility(section.id, true);
                              }
                            }}
                            onDragStop={(_, d) => {
                              toggleGridVisibility(section.id, false);
                              const newCol = Math.round(
                                d.x / (cellWidth + GAP)
                              );
                              const newRow = Math.round(
                                d.y / (cellHeight + GAP)
                              );
                              updateItemPosition(
                                section.id,
                                item.id,
                                newCol,
                                newRow,
                                section.height
                              );
                            }}
                            onResizeStart={() =>
                              toggleGridVisibility(section.id, true)
                            }
                            onResize={() => {
                              if (!section.isGridVisible) {
                                toggleGridVisibility(section.id, true);
                              }
                            }}
                            onResizeStop={(_, __, ref, ___, position) => {
                              toggleGridVisibility(section.id, false);

                              const newWidth = Math.round(
                                ref.offsetWidth / (cellWidth + GAP)
                              );
                              const newHeight = Math.round(
                                ref.offsetHeight / (cellHeight + GAP)
                              );
                              const newCol = Math.round(
                                position.x / (cellWidth + GAP)
                              );
                              const newRow = Math.round(
                                position.y / (cellHeight + GAP)
                              );

                              setSections((prevSections) =>
                                prevSections.map((s) => {
                                  if (s.id !== section.id) return s;

                                  return {
                                    ...s,
                                    items: s.items.map((i) => {
                                      if (i.id !== item.id) return i;

                                      const clampedX = Math.max(
                                        0,
                                        Math.min(gridCols - 1, newCol)
                                      );
                                      const clampedY = Math.max(
                                        0,
                                        Math.min(section.height - 1, newRow)
                                      );
                                      const clampedWidth = Math.max(
                                        1,
                                        Math.min(gridCols - newCol, newWidth)
                                      );
                                      const clampedHeight = Math.max(
                                        1,
                                        Math.min(
                                          section.height - newRow,
                                          newHeight
                                        )
                                      );

                                      if (isMobile) {
                                        return {
                                          ...i,
                                          mobile: {
                                            x: clampedX,
                                            y: clampedY,
                                            width: clampedWidth,
                                            height: clampedHeight,
                                          },
                                        };
                                      } else {
                                        return {
                                          ...i,
                                          desktop: {
                                            x: clampedX,
                                            y: clampedY,
                                            width: clampedWidth,
                                            height: clampedHeight,
                                          },
                                        };
                                      }
                                    }),
                                  };
                                })
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
                </div>

                {/* 섹션 리사이즈 핸들 */}
                <div
                  className="h-px border-t border-dashed border-gray-400 hover:border-blue-500 cursor-ns-resize transition-colors mt-4"
                  onMouseDown={(e) => handleResizeStart(section.id, section, e)}
                ></div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Floating 버튼들 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
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
        {/* 도형 추가 버튼들 */}
        <button
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
        </button>
        <button
          onClick={addButton}
          className="w-12 h-12 bg-orange-500 text-white rounded-md shadow-lg hover:shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center border-2 border-orange-600 text-xs font-semibold"
          title="버튼 추가"
        >
          BTN
        </button>
        <button
          onClick={addText}
          className="w-12 h-12 bg-gray-700 text-white rounded-md shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center border-2 border-gray-800 text-xs font-semibold"
          title="텍스트 추가"
        >
          T
        </button>
      </div>
    </div>
  );
}
