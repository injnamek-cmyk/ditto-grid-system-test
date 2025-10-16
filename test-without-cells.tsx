"use client";

import { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";

// 576개 div 없이도 작동하는 예시
export default function TestWithoutCells() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState({ width: 0, height: 0 });
  const [item, setItem] = useState({ x: 0, y: 0, width: 1, height: 1 });

  useEffect(() => {
    const updateCellSize = () => {
      if (gridRef.current) {
        const gridWidth = gridRef.current.offsetWidth;
        const gridHeight = gridRef.current.offsetHeight;
        const gap = 8;
        setCellSize({
          width: (gridWidth - gap * 23) / 24,
          height: (gridHeight - gap * 23) / 24,
        });
      }
    };
    updateCellSize();
    window.addEventListener("resize", updateCellSize);
    return () => window.removeEventListener("resize", updateCellSize);
  }, []);

  const gap = 8;

  return (
    <div className="w-screen h-screen p-4 bg-gray-50">
      {/* 576개 div 대신 빈 컨테이너만 */}
      <div
        ref={gridRef}
        className="w-full h-full relative bg-white border-2 border-gray-400"
      >
        {/* 드래그는 여전히 작동함! */}
        {cellSize.width > 0 && (
          <Rnd
            position={{
              x: item.x * (cellSize.width + gap),
              y: item.y * (cellSize.height + gap),
            }}
            size={{
              width: item.width * cellSize.width + (item.width - 1) * gap,
              height: item.height * cellSize.height + (item.height - 1) * gap,
            }}
            onDragStop={(e, d) => {
              const newCol = Math.round(d.x / (cellSize.width + gap));
              const newRow = Math.round(d.y / (cellSize.height + gap));
              setItem({
                ...item,
                x: Math.max(0, Math.min(23, newCol)),
                y: Math.max(0, Math.min(23, newRow)),
              });
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              const newWidth = Math.round(ref.offsetWidth / (cellSize.width + gap));
              const newHeight = Math.round(ref.offsetHeight / (cellSize.height + gap));
              const newCol = Math.round(position.x / (cellSize.width + gap));
              const newRow = Math.round(position.y / (cellSize.height + gap));
              setItem({
                x: Math.max(0, Math.min(23, newCol)),
                y: Math.max(0, Math.min(23, newRow)),
                width: Math.max(1, Math.min(24 - newCol, newWidth)),
                height: Math.max(1, Math.min(24 - newRow, newHeight)),
              });
            }}
            dragGrid={[cellSize.width + gap, cellSize.height + gap]}
            resizeGrid={[cellSize.width + gap, cellSize.height + gap]}
            bounds="parent"
            className="absolute"
          >
            <div className="w-full h-full bg-blue-500 rounded cursor-move flex items-center justify-center text-white font-bold">
              작동함!
            </div>
          </Rnd>
        )}
      </div>
    </div>
  );
}
