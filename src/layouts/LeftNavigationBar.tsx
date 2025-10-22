"use client";

import { AddableItemType } from "@/types/item";
import React from "react";

interface LeftNavigationBarProps {
  addItem: (type: AddableItemType) => void;
  onDragStart?: (
    e: React.DragEvent<HTMLButtonElement>,
    itemType: string
  ) => void;
}

export default function LeftNavigationBar({
  addItem,
  onDragStart,
}: LeftNavigationBarProps) {
  return (
    <div className="w-[200px] bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-300 flex flex-col">
      <div className="p-4 border-b border-gray-300">
        <h3 className="text-sm font-bold text-gray-800 tracking-wide">컴포넌트</h3>
        <p className="text-xs text-gray-500 mt-1">클릭 또는 드래그</p>
      </div>

      <section className="flex flex-col gap-3 p-4 sticky top-[84px]">
        <button
          onClick={() => addItem("box")}
          draggable
          onDragStart={(e) => onDragStart?.(e, "box")}
          className="group relative overflow-hidden bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center h-16 border-2 border-gray-300 hover:border-blue-400 cursor-grab active:cursor-grabbing"
          title="박스 추가 (끌어서 드롭)"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-light leading-none">+</span>
            <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 transition-colors">박스</span>
          </div>
        </button>

        <button
          onClick={() => addItem("button")}
          draggable
          onDragStart={(e) => onDragStart?.(e, "button")}
          className="group relative overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-lg shadow-md hover:shadow-lg hover:from-orange-500 hover:to-orange-700 transition-all duration-200 flex items-center justify-center h-16 border-2 border-orange-700 cursor-grab active:cursor-grabbing"
          title="버튼 추가 (끌어서 드롭)"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg font-bold">BTN</span>
            <span className="text-xs font-medium opacity-90 group-hover:opacity-100 transition-opacity">버튼</span>
          </div>
        </button>

        <button
          onClick={() => addItem("text")}
          draggable
          onDragStart={(e) => onDragStart?.(e, "text")}
          className="group relative overflow-hidden bg-gradient-to-br from-gray-600 to-gray-800 text-white rounded-lg shadow-md hover:shadow-lg hover:from-gray-700 hover:to-gray-900 transition-all duration-200 flex items-center justify-center h-16 border-2 border-gray-900 cursor-grab active:cursor-grabbing"
          title="텍스트 추가 (끌어서 드롭)"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg font-bold">T</span>
            <span className="text-xs font-medium opacity-90 group-hover:opacity-100 transition-opacity">텍스트</span>
          </div>
        </button>
      </section>
    </div>
  );
}
