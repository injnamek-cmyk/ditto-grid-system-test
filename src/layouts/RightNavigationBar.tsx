import { useLayoutStore } from "@/store/useLayoutStore";
import { usePageStore } from "@/store/usePageStore";

export default function RightNavBar() {
  // PageStore에서 현재 선택된 섹션, 아이템 ID 구독
  const { sections, selectedSectionId, selectedItemId, updateItem } =
    usePageStore();

  // LayoutStore에서 현재 레이아웃 정보 구독
  const { isMobile } = useLayoutStore();

  // 선택된 아이템 찾기
  const selectedItem = sections
    .find((s) => s.id === selectedSectionId)
    ?.items.find((item) => item.id === selectedItemId);
  // 아무것도 선택되지 않았을 때 표시할 정보
  if (!selectedItemId || !selectedItem) {
    return (
      <div
        className="w-[280px] bg-white border-l border-slate-200 shadow-sm p-4 flex 
  items-center justify-center text-gray-400 text-sm"
      >
        아이템을 선택하세요
      </div>
    );
  }

  // 현재 디바이스에 따른 스타일 정보
  const currentStyle = isMobile
    ? selectedItem.style.mobile
    : selectedItem.style.desktop;

  // 스타일 업데이트 헬퍼 함수
  const updateStyle = (updates: Partial<typeof currentStyle>) => {
    updateItem(selectedSectionId, selectedItemId, (item) => ({
      ...item,
      style: {
        ...item.style,
        [isMobile ? "mobile" : "desktop"]: {
          ...currentStyle,
          ...updates,
        },
      },
    }));
  };

  return (
    <div className="w-[280px] bg-white border-l border-slate-200 shadow-sm overflow-y-auto">
      <div className="p-4">
        {/* 아이템 타입 및 ID */}
        <div className="mb-6 pb-4 border-b border-slate-200">
          <h3 className="font-semibold text-sm text-gray-800 mb-2">
            아이템 정보
          </h3>
          <p className="text-xs text-gray-600 mb-1">
            <span className="font-medium">타입:</span> {selectedItem.type}
          </p>
        </div>

        {/* 배경색 설정 */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-700 block mb-2">
            배경색
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={currentStyle.backgroundColor || "#ffffff"}
              onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
              className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={currentStyle.backgroundColor || "#ffffff"}
              onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              placeholder="#ffffff"
            />
          </div>
        </div>

        {/* 테두리 색 설정 */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-700 block mb-2">
            테두리 색
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={currentStyle.borderColor || "#000000"}
              onChange={(e) => updateStyle({ borderColor: e.target.value })}
              className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={currentStyle.borderColor || "#000000"}
              onChange={(e) => updateStyle({ borderColor: e.target.value })}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* 모서리 둥글기 (borderRadius) */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-700 block mb-2">
            모서리 둥글기: {currentStyle.borderRadius || 0}px
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={currentStyle.borderRadius || 0}
            onChange={(e) =>
              updateStyle({ borderRadius: parseInt(e.target.value) })
            }
            className="w-full cursor-pointer"
          />
        </div>

        {/* 투명도 (opacity) */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-700 block mb-2">
            투명도: {((currentStyle.opacity || 1) * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={currentStyle.opacity || 1}
            onChange={(e) =>
              updateStyle({ opacity: parseFloat(e.target.value) })
            }
            className="w-full cursor-pointer"
          />
        </div>

        {/* text/button 아이템용 속성 */}
        {(selectedItem.type === "text" || selectedItem.type === "button") && (
          <>
            {/* 폰트 크기 */}
            <div className="mb-4 pb-4 border-t border-slate-200">
              <label className="text-xs font-medium text-gray-700 block mb-2">
                폰트 크기: {currentStyle.fontSize || 14}px
              </label>
              <input
                type="range"
                min="8"
                max="32"
                value={currentStyle.fontSize || 14}
                onChange={(e) =>
                  updateStyle({ fontSize: parseInt(e.target.value) })
                }
                className="w-full cursor-pointer"
              />
            </div>

            {/* 폰트 굵기 */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-700 block mb-2">
                폰트 굵기
              </label>
              <div className="flex gap-2">
                {(["normal", "semibold", "bold"] as const).map((weight) => (
                  <button
                    key={weight}
                    onClick={() => updateStyle({ fontWeight: weight })}
                    className={`flex-1 px-2 py-1 text-xs rounded border transition-all ${
                      currentStyle.fontWeight === weight
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {weight === "normal"
                      ? "일반"
                      : weight === "semibold"
                      ? "중간"
                      : "굵음"}
                  </button>
                ))}
              </div>
            </div>

            {/* 텍스트 정렬 */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-700 block mb-2">
                텍스트 정렬
              </label>
              <div className="flex gap-2">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => updateStyle({ textAlign: align })}
                    className={`flex-1 px-2 py-1 text-xs rounded border transition-all ${
                      currentStyle.textAlign === align
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {align === "left"
                      ? "좌"
                      : align === "center"
                      ? "중앙"
                      : "우"}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Padding (모든 아이템) */}
        <div className="mb-4 pb-4 border-t border-slate-200">
          <label className="text-xs font-medium text-gray-700 block mb-2">
            안쪽 여백: {currentStyle.padding || 0}px
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={currentStyle.padding || 0}
            onChange={(e) => updateStyle({ padding: parseInt(e.target.value) })}
            className="w-full cursor-pointer"
          />
        </div>

        {/* 현재 선택된 디바이스 표시 */}
        <div className="text-xs text-gray-500 mt-6 pt-4 border-t border-slate-200">
          현재 편집 모드:{" "}
          <span className="font-medium">
            {isMobile ? "모바일" : "데스크톱"}
          </span>
        </div>
      </div>
    </div>
  );
}
