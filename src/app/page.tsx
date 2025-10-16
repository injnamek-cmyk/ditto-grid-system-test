"use client";

import { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";

type Item = {
  id: string;
  desktop: { x: number; y: number; width: number; height: number };
  mobile: { x: number; y: number; width: number; height: number };
};

export default function Home() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState({ width: 0, height: 0 });
  const [items, setItems] = useState<Item[]>([
    {
      id: "item-1",
      desktop: { x: 0, y: 0, width: 1, height: 1 },
      mobile: { x: 0, y: 0, width: 1, height: 1 },
    },
  ]);

  // 반응형 그리드 컬럼 수 설정
  const [gridCols, setGridCols] = useState(24);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // 아이템 추가 함수
  const addItem = () => {
    const newItem: Item = {
      id: `item-${Date.now()}`,
      desktop: { x: 0, y: 0, width: 2, height: 2 },
      mobile: { x: 0, y: 0, width: 2, height: 2 },
    };
    setItems([...items, newItem]);
  };

  // 그리드 셀 크기 계산
  useEffect(() => {
    const updateCellSize = () => {
      if (gridRef.current) {
        const gridWidth = gridRef.current.offsetWidth;
        const gridHeight = gridRef.current.offsetHeight;
        const gap = 8; // gap-2 = 8px

        // 화면 너비에 따라 컬럼 수 조정
        const width = window.innerWidth;
        const cols = width < 768 ? 12 : 24; // 모바일: 12, 데스크톱: 24
        const mobile = width < 768;

        setGridCols(cols);
        setIsMobile(mobile);

        const cellWidth = (gridWidth - gap * (cols - 1)) / cols;
        const cellHeight = (gridHeight - gap * (cols - 1)) / cols;

        setCellSize({ width: cellWidth, height: cellHeight });
      }
    };

    updateCellSize();
    window.addEventListener("resize", updateCellSize);
    return () => window.removeEventListener("resize", updateCellSize);
  }, []);

  // 반응형 그리드 생성
  const gridCells = Array.from({ length: gridCols * gridCols }, (_, index) => {
    const row = Math.floor(index / gridCols);
    const col = index % gridCols;
    return { row, col, id: `cell-${row}-${col}` };
  });

  const gap = 8;

  console.log(items);

  return (
    <div className="w-screen h-screen p-4 bg-gray-50 relative">
      <div
        ref={gridRef}
        className="w-full h-full grid grid-cols-12 md:grid-cols-24 gap-2 relative"
        style={{
          gridTemplateRows: `repeat(${gridCols}, minmax(0, 1fr))`,
        }}
      >
        {gridCells.map((cell) => (
          <div
            key={cell.id}
            className={`transition-all duration-200 ${
              isVisible ? "bg-slate-200/40" : "bg-transparent"
            }`}
            data-row={cell.row}
            data-col={cell.col}
          />
        ))}

        {cellSize.width > 0 &&
          items.map((item) => {
            const currentItem = isMobile ? item.mobile : item.desktop;

            return (
              <Rnd
                key={item.id}
                position={{
                  x: currentItem.x * (cellSize.width + gap),
                  y: currentItem.y * (cellSize.height + gap),
                }}
                size={{
                  width:
                    currentItem.width * cellSize.width +
                    (currentItem.width - 1) * gap,
                  height:
                    currentItem.height * cellSize.height +
                    (currentItem.height - 1) * gap,
                }}
                onDragStart={() => setIsVisible(true)}
                onDrag={() => {
                  if (!isVisible) setIsVisible(true);
                }}
                onDragStop={(_, d) => {
                  setIsVisible(false);
                  const newCol = Math.round(d.x / (cellSize.width + gap));
                  const newRow = Math.round(d.y / (cellSize.height + gap));

                  setItems(
                    items.map((i) => {
                      if (i.id !== item.id) return i;

                      if (isMobile) {
                        return {
                          ...i,
                          mobile: {
                            ...i.mobile,
                            x: Math.max(0, Math.min(gridCols - 1, newCol)),
                            y: Math.max(0, Math.min(gridCols - 1, newRow)),
                          },
                        };
                      } else {
                        return {
                          ...i,
                          desktop: {
                            ...i.desktop,
                            x: Math.max(0, Math.min(gridCols - 1, newCol)),
                            y: Math.max(0, Math.min(gridCols - 1, newRow)),
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
                    ref.offsetWidth / (cellSize.width + gap)
                  );
                  const newHeight = Math.round(
                    ref.offsetHeight / (cellSize.height + gap)
                  );
                  const newCol = Math.round(
                    position.x / (cellSize.width + gap)
                  );
                  const newRow = Math.round(
                    position.y / (cellSize.height + gap)
                  );

                  setItems(
                    items.map((i) => {
                      if (i.id !== item.id) return i;

                      if (isMobile) {
                        return {
                          ...i,
                          mobile: {
                            x: Math.max(0, Math.min(gridCols - 1, newCol)),
                            y: Math.max(0, Math.min(gridCols - 1, newRow)),
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
                            x: Math.max(0, Math.min(gridCols - 1, newCol)),
                            y: Math.max(0, Math.min(gridCols - 1, newRow)),
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
                dragGrid={[cellSize.width + gap, cellSize.height + gap]}
                resizeGrid={[cellSize.width + gap, cellSize.height + gap]}
                bounds="parent"
                className="absolute"
              >
                <div className="w-full h-full bg-blue-500 rounded cursor-move flex items-center justify-center text-white font-bold border-2 border-blue-600"></div>
              </Rnd>
            );
          })}
      </div>

      {/* Floating 아이템 추가 버튼 */}
      <button
        onClick={addItem}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 hover:scale-110 transition-all flex items-center justify-center text-2xl font-bold"
        title="아이템 추가"
      >
        +
      </button>
    </div>
  );
}
