"use client";

import React from "react";

interface LeftNavigationBarProps {
  onAddBox: () => void;
  onAddButton: () => void;
  onAddText: () => void;
  onDragStart?: (
    e: React.DragEvent<HTMLButtonElement>,
    itemType: string
  ) => void;
}

export default function LeftNavigationBar({
  onAddBox,
  onAddButton,
  onAddText,
  onDragStart,
}: LeftNavigationBarProps) {
  return (
    <div className="w-[200px] p-4 bg-white border-r border-gray-200">
      <section className="grid grid-cols2 gap-2 sticky top-[84px]">
        <button
          onClick={onAddBox}
          draggable
          onDragStart={(e) => onDragStart?.(e, "box")}
          className="bg-white text-gray-700 rounded-md shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-2xl font-light border border-gray-200 cursor-grab active:cursor-grabbing"
          title="박스 추가 (끌어서 드롭)"
        >
          +
        </button>
        <button
          onClick={onAddButton}
          draggable
          onDragStart={(e) => onDragStart?.(e, "button")}
          className="bg-orange-500 text-white rounded-md shadow-lg hover:shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center border-2 border-orange-600 text-xs font-semibold cursor-grab active:cursor-grabbing"
          title="버튼 추가 (끌어서 드롭)"
        >
          BTN
        </button>
        <button
          onClick={onAddText}
          draggable
          onDragStart={(e) => onDragStart?.(e, "text")}
          className="bg-gray-700 text-white rounded-md shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center border-2 border-gray-800 text-xs font-semibold cursor-grab active:cursor-grabbing"
          title="텍스트 추가 (끌어서 드롭)"
        >
          T
        </button>
      </section>
    </div>
  );
}
