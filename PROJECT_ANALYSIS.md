# 그리드 시스템 프로젝트 분석

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [아키텍처 구조](#아키텍처-구조)
3. [핵심 기능 분석](#핵심-기능-분석)
4. [상태 관리](#상태-관리)
5. [데이터 흐름](#데이터-흐름)

---

## 프로젝트 개요

이 프로젝트는 **반응형 그리드 기반 드래그 앤 드롭 캔버스 시스템**입니다. 사용자는 좌측 네비게이션바(LNB)에서 요소를 클릭하거나 드래그하여 캔버스에 추가할 수 있으며, 추가된 요소는 그리드 스냅에 맞춰 배치됩니다.

### 주요 특징
- ✅ 클릭/드래그 앤 드롭으로 요소 추가
- ✅ 그리드 스냅 기능
- ✅ 드래그 시 크기 미리보기
- ✅ 섹션 추가 및 리사이즈
- ✅ JSON 저장 및 로딩
- ✅ 반응형 레이아웃 (모바일/데스크톱)

---

## 아키텍처 구조

### 디렉토리 구조

```
src/
├── app/
│   ├── page.tsx                 # 메인 페이지 (상태 관리 중심)
│   └── layout.tsx               # 레이아웃
├── layouts/
│   ├── Header.tsx               # 헤더
│   └── LeftNavigationBar.tsx     # 좌측 네비게이션바
├── components/
│   ├── Canvas.tsx               # 캔버스 컨테이너
│   ├── Section.tsx              # 섹션 컴포넌트
│   ├── GridCells.tsx            # 그리드 셀 렌더링
│   ├── ItemRenderer.tsx         # 아이템 렌더링 (react-rnd)
│   ├── DragPreview.tsx          # 드래그 미리보기
│   └── PixiCanvas.tsx           # 도형 렌더링 (Pixi.js)
├── hooks/
│   ├── usePageState.ts          # 페이지 상태 관리
│   ├── useDragAndDrop.ts        # 드래그 앤 드롭 로직
│   ├── useGridDimensions.ts     # 그리드 크기 계산
│   ├── useGridVisibility.ts     # 그리드 가시성 관리
│   └── useSectionResize.ts      # 섹션 리사이즈
├── store/
│   ├── useGridStore.ts          # 그리드 정보 (Zustand)
│   └── useSectionStore.ts       # 섹션/아이템 선택 상태
├── lib/
│   ├── gridCalculations.ts      # 그리드 좌표 계산
│   └── itemFactory.ts           # 아이템 생성 팩토리
├── constants/
│   ├── grid.ts                  # 그리드 상수 (GAP, ASPECT_RATIO)
│   └── itemConfig.ts            # 아이템 설정 (기본 크기)
└── types/
    └── item.ts                  # 아이템 타입 정의
```

---

## 핵심 기능 분석

### 1️⃣ LNB에서 요소를 클릭해서 추가할 때의 로직

#### 시작점: `src/layouts/LeftNavigationBar.tsx:24-32`
```jsx
<button
  onClick={onAddBox}
  draggable
  onDragStart={(e) => onDragStart?.(e, "box")}
  ...
>
  +
</button>
```

#### 실행 흐름:

**Step 1: 클릭 핸들러 호출** (`src/app/page.tsx:92-102`)

```javascript
const addBox = () => {
  addItemAtPosition(selectedSectionId, "box", 0, 0);
};

const addButton = () => {
  addItemAtPosition(selectedSectionId, "button", 0, 0);
};

const addText = () => {
  addItemAtPosition(selectedSectionId, "text", 0, 0);
};
```

`addBox`, `addButton`, `addText` 함수들은 모두 `addItemAtPosition`을 호출하되, 두 번째 매개변수(아이템 타입)만 다릅니다. 이는 단일 제네릭 함수 `addItem(type: AddableItemType)`로 통합 가능하며, 현재 구조는 불필요한 래퍼 함수의 중복입니다.

**Step 2: `addItemAtPosition` 함수** (`src/hooks/usePageState.ts:127-166`)
```javascript
const addItemAtPosition = useCallback(
  (sectionId: string, type: AddableItemType, x: number, y: number) => {
    const newItem: Item = {
      id: uuidv4(),                    // 고유 ID 생성
      type: type as "box" | "button" | "text",
      style: {
        desktop: { position: { x, y }, width: 2, height: 2 },  // 데스크톱 기본 크기
        mobile: { position: { x, y }, width: 2, height: 2 }    // 모바일 기본 크기
      }
    };

    // 섹션의 items 배열에 새 아이템 추가
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, items: [...s.items, newItem] }
          : s
      )
    );
  }
);
```

**Step 3: 렌더링** (`src/components/ItemRenderer.tsx`)

업데이트된 `sections` 상태가 `Canvas` → `Section` → `ItemRenderer`로 전파됩니다. 이는 **React의 단방향 데이터 흐름**에 따른 것입니다:

1. **최상위 `page.tsx`에서 `sections` 상태 관리**: 모든 데이터의 단일 진실 공급원(SSOT)
2. **props로 자식에게 순차 전달**: `Canvas`는 `sections` props 받음 → `Section`에 각 섹션 전달 → `ItemRenderer`에 items 전달
3. **각 Component에서 직접 구독하지 않는 이유**: 데이터 중복 관리를 피하고, 상태 변화를 추적 가능하게 함

`react-rnd` 라이브러리로 드래그 가능한 컴포넌트를 렌더링하며, 아이템은 `selectedSectionId`의 섹션에 추가됩니다.

#### 핵심 포인트:
- ✅ **클릭 → `addItemAtPosition()` → 새 아이템 객체 생성 → 상태 업데이트 → 렌더링**
- ✅ **위치(x, y)는 (0, 0)으로 고정** → 사용자가 후에 드래그로 이동 가능
- ✅ **기본 크기는 `itemConfig.ts`에 정의된 ITEM_CONFIG에서 가져옴**

---

### 2️⃣ LNB에서 요소를 드래그 앤 드롭으로 추가할 때의 로직

#### 시작점: `src/layouts/LeftNavigationBar.tsx:26-27`
```jsx
draggable
onDragStart={(e) => onDragStart?.(e, "box")}
```

#### 실행 흐름:

**Step 1: LNB에서 드래그 시작** (`src/hooks/useDragAndDrop.ts:66-72`)
```javascript
const handleLNBDragStart = (
  e: React.DragEvent<HTMLButtonElement>,
  itemType: string
) => {
  setDraggedItemType(itemType);              // 드래그 중인 아이템 타입 저장
  e.dataTransfer.effectAllowed = "copy";    // 복사 효과 설정
};
```

`e.dataTransfer.effectAllowed = "copy"`는 브라우저에 **"이 드래그는 복사(copy) 작업이다"**라고 알리는 것으로, 드래그 커서 모양을 제어하고 사용자에게 시각적 피드백을 제공합니다.

**Step 2: 캔버스(섹션)에 드래그 오버** (`src/hooks/useDragAndDrop.ts:75-112`)
```javascript
const handleSectionDragOver = (
  e: React.DragEvent<HTMLDivElement>,
  sectionId: string,
  sectionHeight: number
) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";

  // 드래그 중인 아이템 타입이 있으면
  if (!draggedItemType) return;

  // 그리드 가시성 활성화
  onShowGrid?.(sectionId);

  // 마우스 좌표를 그리드 좌표로 변환
  const sectionElement = e.currentTarget;  // Section 컴포넌트의 div (이벤트 리스너가 등록된 엘리먼트)
  const coordinates = getGridCoordinatesFromEvent(
    e,
    sectionElement,
    cellWidth,
    cellHeight,
    gridCols,
    sectionHeight
  );

  // ITEM_GRID_SIZE에서 아이템의 그리드 크기 가져오기
  const itemSize = ITEM_GRID_SIZE[draggedItemType as AddableItemType];

  // 미리보기 상태 업데이트 (DragPreview 컴포넌트가 렌더링)
  setDragPreview({
    sectionId,
    gridX: coordinates.x,
    gridY: coordinates.y,
    cellWidth: itemSize.cellWidth,
    cellHeight: itemSize.cellHeight,
  });
};
```

**Step 3: 좌표 변환** (`src/lib/gridCalculations.ts:13-48`)

이 함수는 마우스의 절대 좌표를 그리드 셀 인덱스로 변환하는 핵심 로직입니다. `querySelector`로 실제 그리드 컨테이너를 찾는 이유는, Section 엘리먼트 자체가 아닌 그 내부의 그리드 div의 정확한 위치가 필요하기 때문입니다 (CSS 레이아웃에 의해 위치가 달라질 수 있으므로).

6개의 매개변수가 전달되는 이유는 **순수 함수 설계 원칙**을 따르기 때문입니다:

- **`event`**: 마우스 위치 정보 (`event.clientX`, `event.clientY`)
- **`sectionElement`**: 그리드의 정확한 DOM 위치를 찾기 위해 필요
- **`cellWidth`, `cellHeight`**: 픽셀 좌표를 셀 단위로 변환하기 위해 필요
- **`gridCols`, `sectionHeight`**: 계산 후 바운더리 체크(범위 제한)를 위해 필요

함수가 외부 상태에 의존하지 않고 모든 필요 정보를 매개변수로 받으므로, 예측 가능하고 테스트하기 쉽습니다.

```javascript
export const getGridCoordinatesFromEvent = (
  event: React.DragEvent<HTMLDivElement>,
  sectionElement: HTMLElement,
  cellWidth: number,
  cellHeight: number,
  gridCols: number,
  sectionHeight: number
): { x: number; y: number } | null => {
  // 그리드 컨테이너의 DOM 위치 구하기
  const gridContainer = sectionElement.querySelector(".w-full.grid.grid-cols-12");
  const gridRect = gridContainer.getBoundingClientRect();  // getBoundingClientRect는 브라우저 API로 엘리먼트의 절대 위치/크기 반환

  // 마우스 위치를 그리드 기준 상대 좌표로 변환
  const relativeX = event.clientX - gridRect.left;
  const relativeY = event.clientY - gridRect.top;

  // 그리드 셀 좌표 계산 (GAP 고려)
  const cellWithGap = cellWidth + GAP;      // 셀 + 간격
  const rowWithGap = cellHeight + GAP;

  let gridX = Math.floor(relativeX / cellWithGap);  // coordinates.x: 현재 마우스가 있는 셀의 x 인덱스
  let gridY = Math.floor(relativeY / rowWithGap);   // coordinates.y: 현재 마우스가 있는 셀의 y 인덱스

  // 바운더리 체크 (그리드 범위 내로 클램프)
  gridX = Math.max(0, Math.min(gridCols - 1, gridX));
  gridY = Math.max(0, Math.min(sectionHeight - 1, gridY));

  return { x: gridX, y: gridY };  // 미리보기 박스 위치 및 범위 제한에 사용됨
};
```

**Step 4: 드롭** (`src/hooks/useDragAndDrop.ts:124-158`)
```javascript
const handleSectionDrop = (
  e: React.DragEvent<HTMLDivElement>,
  sectionId: string
) => {
  e.preventDefault();

  if (!draggedItemType) return;

  // 섹션 찾기
  const section = sections.find((s) => s.id === sectionId);  // DOM 엘리먼트가 아닌 데이터 객체 필요
  if (!section) return;

  // 드롭 위치의 그리드 좌표 계산
  const coordinates = getGridCoordinatesFromEvent(...);

  // 드롭 위치에 아이템 추가
  addItemAtPosition(
    sectionId,
    draggedItemType as AddableItemType,
    coordinates.x,
    coordinates.y
  );

  // 드래그 상태 초기화
  resetDragState();
};
```

`handleSectionDrop`에서 `e.currentTarget`(DOM 엘리먼트)과 `section`(데이터 객체)을 모두 필요로 하는 이유:
- **`sectionElement` (e.currentTarget)**: 마우스 좌표를 그리드 좌표로 변환하기 위해 그리드의 물리적 위치 필요
- **`section` (데이터)**: 섹션의 높이 정보가 필요하며, 아이템 추가 시 섹션의 데이터 구조 참조 필요

#### 핵심 포인트:
- ✅ **5단계 프로세스**: 드래그시작 → 드래그오버 → 좌표계산 → 미리보기 → 드롭
- ✅ **좌표 변환**: 마우스 절대 위치 → 그리드 상대 좌표 → 셀 인덱스
- ✅ **GAP 고려**: 셀 간 8px 간격을 계산에 포함
- ✅ **바운더리 클램프**: 그리드 범위를 벗어나지 않도록 좌표 제한

---

### 3️⃣ 그리드 스냅은 어떤 로직을 통해 작동되는가?

#### 3-1. 그리드 크기 계산 (`src/hooks/useGridDimensions.ts`)

```javascript
export const useGridDimensions = (): UseGridDimensionsReturn => {
  const [cellWidth, setCellWidth] = useState(0);
  const [cellHeight, setCellHeight] = useState(0);
  const [gridCols, setGridCols] = useState(24);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateCellSize = () => {
      if (gridRef.current) {
        // 화면 너비에 따라 컬럼 수 결정
        const width = window.innerWidth;
        const cols = width < 768 ? 12 : 24;  // 모바일: 12열, 데스크톱: 24열
        const mobile = width < 768;

        // CSS Grid가 실제로 렌더링한 셀 크기 측정
        const firstCell = gridRef.current.querySelector(
          '[data-row="0"][data-col="0"]'
        );

        if (firstCell) {
          const rect = firstCell.getBoundingClientRect();
          const calculatedCellWidth = rect.width;
          // 비율 유지 (가로:세로 = 1.6:1)
          const calculatedCellHeight = calculatedCellWidth / CELL_ASPECT_RATIO;

          setCellWidth(calculatedCellWidth);
          setCellHeight(calculatedCellHeight);
        }
      }
    };

    // ResizeObserver로 실시간 모니터링
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateCellSize);
    });

    if (gridRef.current) {
      resizeObserver.observe(gridRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);
};
```

#### 3-2. 그리드 셀 렌더링 (`src/components/GridCells.tsx`)

```javascript
export default function GridCells({
  gridCols,
  sectionHeight,
  gridVisibleSectionId,
  currentSectionId,
}) {
  // 섹션별로 그리드 셀 배열 생성
  const sectionGridCells = Array.from(
    { length: gridCols * sectionHeight },  // 예: 24 * 24 = 576개 셀
    (_, index) => {
      const row = Math.floor(index / gridCols);
      const col = index % gridCols;
      return { row, col, id: `section-${currentSectionId}-cell-${row}-${col}` };
    }
  );

  return (
    <>
      {sectionGridCells.map((cell) => (
        <div
          key={cell.id}
          className={`transition-all ${
            gridVisibleSectionId === currentSectionId
              ? "bg-slate-200/40"  // 그리드 가시성: 보임
              : "bg-transparent"   // 그리드 가시성: 숨김
          }`}
          data-row={cell.row}
          data-col={cell.col}
        />
      ))}
    </>
  );
}
```

#### 3-3. Section의 CSS Grid 설정 (`src/components/Section.tsx:163-171`)

```jsx
<div
  ref={gridRef}
  className="w-full grid grid-cols-12 md:grid-cols-24 gap-2"
  style={{
    gridTemplateRows: `repeat(${section.height}, ${cellHeight}px)`,
    height: `${
      section.height * cellHeight + (section.height - 1) * GAP
    }px`,
  }}
>
```

#### 3-4. 아이템 드래그 시 스냅 (`src/components/ItemRenderer.tsx:128-129`)

```javascript
<Rnd
  dragGrid={[cellWidth + GAP, cellHeight + GAP]}  // 드래그 스냅: 셀 크기 단위
  resizeGrid={[cellWidth + GAP, cellHeight + GAP]}  // 리사이즈 스냅: 셀 크기 단위
  bounds="parent"  // 부모 요소 범위 내로 제한
>
```

#### 3-5. 아이템 위치 스냅 (`src/components/ItemRenderer.tsx:93-98`)

```javascript
onDragStop={(_, d) => {
  onToggleGridVisibility(sectionId, false);
  // 픽셀 좌표를 그리드 셀 좌표로 변환
  const newCol = Math.round(d.x / (cellWidth + GAP));
  const newRow = Math.round(d.y / (cellHeight + GAP));
  onItemDragStop(sectionId, item.id, newCol, newRow);
};
```

#### 스냅 로직 요약:

| 단계 | 역할 | 구현 |
|------|------|------|
| **1. 셀 크기 계산** | 반응형 그리드 셀 너비/높이 결정 | `useGridDimensions` - ResizeObserver로 실시간 측정 |
| **2. 그리드 생성** | CSS Grid로 셀 배열 렌더링 | `GridCells` - `gridCols × sectionHeight`개 셀 생성 |
| **3. 드래그 그리드 설정** | react-rnd의 dragGrid/resizeGrid 설정 | `[cellWidth + GAP, cellHeight + GAP]` 단위로 스냅 |
| **4. 좌표 변환** | 픽셀 좌표를 셀 인덱스로 변환 | `Math.round(px / (cellWidth + GAP))` |
| **5. 저장** | 계산된 셀 인덱스로 상태 업데이트 | `updateItemPosition` 호출 |

#### 핵심 포인트:
- ✅ **반응형 스냅**: 화면 크기 변경 시 `ResizeObserver`로 자동 재계산
- ✅ **GAP 포함**: 셀 간 8px 간격을 스냅 그리드에 포함
- ✅ **이중 좌표계**: 픽셀(렌더링용) ↔ 셀 인덱스(데이터 저장)
- ✅ **CSS Grid 기반**: 레이아웃은 CSS Grid, 아이템은 절대 위치(Rnd)

---

### 4️⃣ LNB에서 드래그 앤 드롭으로 요소를 생성할 때 생성될 요소의 크기 미리보기는 어떻게 작동되는가?

#### 4-1. 미리보기 상태 저장 (`src/hooks/useDragAndDrop.ts:104-111`)

```javascript
// 드래그 오버 중에 미리보기 상태 업데이트
setDragPreview({
  sectionId,
  gridX: coordinates.x,              // 마우스 위치의 X 좌표 (셀 단위)
  gridY: coordinates.y,              // 마우스 위치의 Y 좌표 (셀 단위)
  cellWidth: itemSize.cellWidth,     // 아이템의 셀 너비 (예: button은 3)
  cellHeight: itemSize.cellHeight,   // 아이템의 셀 높이 (예: button은 2)
});
```

**아이템별 기본 크기** (`src/constants/itemConfig.ts:25-29`):
```javascript
export const ITEM_GRID_SIZE: Record<AddableItemType, { cellWidth: number; cellHeight: number }> = {
  box: { cellWidth: 2, cellHeight: 2 },
  button: { cellWidth: 3, cellHeight: 2 },
  text: { cellWidth: 2, cellHeight: 1 },
};
```

#### 4-2. 미리보기 렌더링 (`src/components/DragPreview.tsx`)

```javascript
export default function DragPreview({
  dragPreview,
  currentSectionId,
}) {
  const cellWidth = useGridStore((state) => state.cellWidth);
  const cellHeight = useGridStore((state) => state.cellHeight);

  // 현재 섹션의 미리보기만 렌더링
  if (!dragPreview || dragPreview.sectionId !== currentSectionId) {
    return null;
  }

  return (
    <div
      className="absolute border-2 border-dashed border-blue-400 pointer-events-none"
      style={{
        // X 위치: 셀 인덱스 × (셀 너비 + 간격)
        left: `${dragPreview.gridX * (cellWidth + GAP)}px`,
        // Y 위치: 셀 인덱스 × (셀 높이 + 간격)
        top: `${dragPreview.gridY * (cellHeight + GAP)}px`,
        // 너비: (셀 개수 × 셀 너비) + (셀 개수 - 1) × 간격
        width: `${
          dragPreview.cellWidth * cellWidth +
          (dragPreview.cellWidth - 1) * GAP
        }px`,
        // 높이: (셀 개수 × 셀 높이) + (셀 개수 - 1) × 간격
        height: `${
          dragPreview.cellHeight * cellHeight +
          (dragPreview.cellHeight - 1) * GAP
        }px`,
        backgroundColor: "rgba(59, 130, 246, 0.05)",  // 반투명 파란색
      }}
    />
  );
}
```

#### 4-3. 미리보기 데이터 흐름

`handleSectionDragOver`는 **마우스가 섹션 위에서 움직일 때마다 호출되어 미리보기를 실시간으로 업데이트**하는 함수입니다. 섹션의 드래그 리스너에서 호출되므로, `e.currentTarget`은 항상 Section 엘리먼트가 됩니다.

```
사용자 드래그 (마우스 이동)
  ↓
handleSectionDragOver (Section의 onDragOver에서 호출됨)
  ├─ e.currentTarget = Section의 div (이벤트 리스너가 등록된 엘리먼트)
  ├─ getGridCoordinatesFromEvent() → 마우스 위치를 그리드 좌표로 변환
  ├─ ITEM_GRID_SIZE에서 아이템 기본 크기 조회
  └─ setDragPreview(위치, 크기) → 상태 업데이트 (계속 반복)
  ↓
DragPreview 컴포넌트 (매번 리렌더링)
  ├─ dragPreview 상태 구독
  ├─ cellWidth, cellHeight 구독 (useGridStore)
  ├─ 셀 좌표를 픽셀 좌표로 변환
  └─ 파란 점선 박스 렌더링 (사용자가 드래그할 때 따라다님)
```

#### 4-4. 미리보기 숨김 (`src/hooks/useDragAndDrop.ts:115-121`)

```javascript
// 드래그가 섹션을 벗어났을 때
const handleSectionDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
  // 자식 요소로 나간 것이 아닌 경우에만 초기화
  if (e.currentTarget === e.target) {
    setDragPreview(null);      // 미리보기 제거
    onHideGrid?.();            // 그리드 숨김
  }
};
```

#### 핵심 포인트:
- ✅ **실시간 계산**: 마우스 움직임에 따라 `dragPreview` 상태 실시간 업데이트
- ✅ **타입별 크기**: 아이템 타입에 따라 `ITEM_GRID_SIZE`에서 기본 크기 결정
- ✅ **픽셀 변환**: 셀 좌표와 크기를 픽셀 좌표로 변환하여 렌더링
- ✅ **반응형 대응**: `cellWidth`, `cellHeight` 변경 시 자동 재계산 (Zustand 구독)
- ✅ **포인터 이벤트 차단**: `pointer-events-none`으로 미리보기가 드래그 방해 안 함

---

### 5️⃣ 섹션 추가와 섹션 리사이즈는 어떻게 작동되는가?

#### 5-1. 섹션 추가 (`src/hooks/usePageState.ts:101-109`)

```javascript
const addSection = useCallback(() => {
  const newSection: Section = {
    id: uuidv4(),                      // 고유 UUID 생성
    height: 24,                        // 기본 높이 24행
    backgroundColor: "#ffffff",        // 기본 배경색 흰색
    items: [],                         // 빈 아이템 배열
  };
  setSections((prev) => [...prev, newSection]);  // 섹션 배열에 추가
}, []);
```

**호출** (`src/app/page.tsx:226-232`):
```jsx
<button
  onClick={addSection}
  className="px-4 py-2 bg-white text-gray-700 font-bold rounded-md shadow-lg ..."
  title="섹션 추가"
>
  + section
</button>
```

#### 5-2. 섹션 리사이즈 로직

##### A. 리사이즈 시작 (`src/hooks/useSectionResize.ts:29-38`)

```javascript
const handleResizeStart = (
  sectionId: string,
  sectionHeight: number,
  e: React.MouseEvent
) => {
  e.preventDefault();
  setResizingSectionId(sectionId);       // 리사이즈 중인 섹션 ID 저장
  setResizeStartY(e.clientY);            // 마우스 시작 Y 좌표 저장
  setResizeStartHeight(sectionHeight);   // 섹션 시작 높이 저장
};
```

**호출** (`src/components/Section.tsx:220-225`):
```jsx
<div
  className="h-px border-t border-dashed border-gray-400 hover:border-blue-500 cursor-ns-resize"
  onMouseDown={(e) =>
    onSectionResizeStart(section.id, section.height, e)
  }
/>
```

##### B. 리사이즈 계산 및 업데이트 (`src/hooks/useSectionResize.ts:40-63`)

```javascript
const updateSectionHeight = (callback: (newHeight: number) => void) => {
  if (resizingSectionId === null) return;

  const handleMouseMove = (e: MouseEvent) => {
    // 마우스 Y 좌표 변화 계산
    const deltaY = e.clientY - resizeStartY;

    // 셀 단위로 높이 변화 계산 (행 몇 개 증가/감소했는가)
    const rowHeight = cellHeight + GAP;  // 셀 높이 + 간격
    const deltaRows = Math.round(deltaY / rowHeight);

    // 새로운 섹션 높이 (최소 12행)
    const newHeight = Math.max(12, resizeStartHeight + deltaRows);

    // 콜백으로 높이 업데이트
    callback(newHeight);
  };

  const handleMouseUp = () => {
    setResizingSectionId(null);  // 리사이즈 완료
  };

  // 전역 마우스 이벤트 리스너 등록
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  // 정리: 이벤트 리스너 제거
  return () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };
};
```

##### C. 높이 상태 업데이트 (`src/hooks/usePageState.ts:301-308`)

```javascript
const updateSectionHeight = useCallback(
  (sectionId: string, newHeight: number) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, height: newHeight }  // 해당 섹션의 높이만 업데이트
          : s
      )
    );
  },
  []
);
```

##### D. 호출 체인 (`src/app/page.tsx:178-187`)

```javascript
useEffect(() => {
  if (resizingSectionId === null) return;

  // useSectionResize의 updateSectionHeight 호출
  const cleanup = triggerResize((newHeight) => {
    // usePageState의 updateSectionHeight 호출
    updateSectionHeight(resizingSectionId, newHeight);
  });

  return cleanup;
}, [resizingSectionId, triggerResize, updateSectionHeight]);
```

#### 5-3. 섹션 높이 렌더링 (`src/components/Section.tsx:163-171`)

```jsx
<div
  ref={gridRef}
  className="w-full grid grid-cols-12 md:grid-cols-24 gap-2"
  style={{
    // gridTemplateRows: 행의 개수와 높이 정의
    gridTemplateRows: `repeat(${section.height}, ${cellHeight}px)`,
    // 섹션의 실제 높이: (행 개수 × 셀 높이) + (행 개수 - 1) × 간격
    height: `${
      section.height * cellHeight + (section.height - 1) * GAP
    }px`,
  }}
>
```

#### 섹션 리사이즈 플로우:

```
사용자 마우스 다운 (리사이즈 핸들)
  ↓
handleResizeStart (useSectionResize)
  ├─ resizingSectionId = section.id
  ├─ resizeStartY = e.clientY
  └─ resizeStartHeight = section.height
  ↓
사용자 마우스 이동
  ↓
handleMouseMove (문서 레벨 리스너)
  ├─ deltaY = 현재 Y - 시작 Y
  ├─ deltaRows = Math.round(deltaY / (cellHeight + GAP))
  ├─ newHeight = Math.max(12, resizeStartHeight + deltaRows)
  └─ callback(newHeight)
  ↓
updateSectionHeight (usePageState)
  ├─ setSections로 높이 상태 업데이트
  └─ 리렌더링
  ↓
Section 컴포넌트
  ├─ gridTemplateRows 재계산
  └─ CSS Grid 높이 조정
  ↓
사용자 마우스 업
  ↓
handleMouseUp (문서 레벨 리스너)
  └─ resizingSectionId = null, 리스너 제거
```

#### 핵심 포인트:
- ✅ **섹션 추가**: UUID 생성 → 기본값 설정 → 배열 추가 → 자동 렌더링
- ✅ **리사이즈**: 마우스 이동 거리 → 행 단위 변화 계산 → 높이 상태 업데이트
- ✅ **행 단위 스냅**: `Math.round(deltaY / (cellHeight + GAP))`로 행 단위 변화
- ✅ **최소 높이 보장**: `Math.max(12, ...)`로 최소 12행 유지
- ✅ **문서 레벨 리스너**: 빠르게 마우스를 움직여도 정확하게 추적 가능

---

### 6️⃣ JSON으로 저장한 데이터를 화면에 렌더링하는 로직은 어떻게 작동되는가?

#### 6-1. 페이지 저장 (`src/hooks/usePageState.ts:331-341`)

```javascript
const savePage = useCallback(() => {
  const page: Page = {
    id: uuidv4(),
    sections,                           // 현재 섹션 배열
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // localStorage에 JSON 문자열로 저장
  localStorage.setItem("gridPage", JSON.stringify(page));
  alert("페이지가 저장되었습니다!");
}, [sections]);
```

#### 저장되는 데이터 구조:

```json
{
  "id": "uuid-string",
  "sections": [
    {
      "id": "section-uuid",
      "height": 24,
      "backgroundColor": "#ffffff",
      "items": [
        {
          "id": "item-uuid",
          "type": "button",
          "content": "Click me",
          "style": {
            "desktop": {
              "position": { "x": 5, "y": 3 },
              "width": 3,
              "height": 2
            },
            "mobile": {
              "position": { "x": 2, "y": 1 },
              "width": 2,
              "height": 1
            }
          }
        }
      ]
    }
  ],
  "createdAt": "2024-10-22T10:30:00.000Z",
  "updatedAt": "2024-10-22T10:30:00.000Z"
}
```

#### 6-2. 페이지 로딩 (`src/hooks/usePageState.ts:83-98`)

```javascript
useEffect(() => {
  if (typeof window === "undefined") return; // SSR 방지

  // localStorage에서 저장된 데이터 조회
  const savedPage = localStorage.getItem("gridPage");

  if (savedPage) {
    try {
      // JSON 문자열을 객체로 파싱
      const page: Page = JSON.parse(savedPage);

      // 저장된 섹션들로 상태 업데이트
      setSections(page.sections);

      // 첫 번째 섹션 선택
      if (page.sections.length > 0) {
        setSelectedSectionId(page.sections[0].id);
      }
    } catch (error) {
      console.error("페이지 데이터 불러오기 실패:", error);
    }
  }
}, []);  // 마운트 시점에만 실행
```

#### 6-3. 데이터 렌더링 흐름

```
App 마운트
  ↓
usePageState 훅 로드
  ↓
useEffect (빈 의존성 배열)
  ├─ localStorage.getItem("gridPage")
  ├─ JSON.parse() → 객체 변환
  ├─ setSections() → 상태 업데이트
  └─ setSelectedSectionId()
  ↓
Canvas 컴포넌트 렌더링
  ↓
sections.map() → Section 컴포넌트 배열 생성
  ↓
각 Section 컴포넌트
  ├─ GridCells 렌더링 (section.height만큼 셀 생성)
  ├─ ItemRenderer 렌더링
  │   └─ section.items.map() → Rnd 컴포넌트 배열 생성
  │       ├─ 각 아이템의 style[데스크톱/모바일] 적용
  │       ├─ position으로 절대 위치 설정
  │       ├─ width, height로 크기 설정
  │       └─ 아이템 타입별 컨텐츠 렌더링
  └─ Section 배경색 적용
```

#### 6-4. 아이템별 스타일 적용 (`src/components/ItemRenderer.tsx:66-82`)

```javascript
nonShapeItems.map((item) => {
  // 현재 기기(모바일/데스크톱)에 따라 스타일 선택
  const currentItem = isMobile
    ? item.style.mobile
    : item.style.desktop;

  return (
    <Rnd
      position={{
        // 셀 좌표 → 픽셀 좌표 변환
        x: currentItem.position.x * (cellWidth + GAP),
        y: currentItem.position.y * (cellHeight + GAP),
      }}
      size={{
        // 셀 크기 → 픽셀 크기 변환
        width: currentItem.width * cellWidth + (currentItem.width - 1) * GAP,
        height: currentItem.height * cellHeight + (currentItem.height - 1) * GAP,
      }}
    >
```

#### 6-5. 반응형 대응

```javascript
// desktop과 mobile 속성이 분리되어 있어 반응형 자동 처리
const currentItem = isMobile ? item.style.mobile : item.style.desktop;

// 예: Button 아이템
// - desktop: width: 3, height: 2 (더 큼)
// - mobile: width: 2, height: 1 (작음)

// isMobile 상태가 변경되면 자동으로 현재 스타일 적용
```

#### 데이터 라이프사이클:

```
저장 단계:
  현재 상태 (sections)
    → Page 객체 생성 (id, timestamp 추가)
    → JSON.stringify()
    → localStorage 저장

로딩 단계:
  localStorage.getItem()
    → JSON.parse()
    → Page 객체 복원
    → setSections() (상태 업데이트)
    → React 리렌더링

렌더링 단계:
  각 Section
    → 각 Item
      → 저장된 style 데이터 적용
      → 현재 기기(isMobile)에 맞는 스타일 선택
      → Rnd로 위치/크기 적용
      → 아이템 타입별 UI 렌더링
```

#### 핵심 포인트:
- ✅ **localStorage 활용**: 클라이언트 로컬 저장소에 JSON 저장
- ✅ **반응형 데이터**: desktop/mobile 스타일 분리로 자동 반응형 대응
- ✅ **마운트 시점 로딩**: useEffect 빈 의존성으로 앱 시작 시점에만 로딩
- ✅ **좌표 변환**: 저장된 셀 좌표 → 픽셀 좌표로 변환하여 렌더링
- ✅ **타임스탐프**: createdAt, updatedAt으로 저장 시간 추적

---

## 상태 관리

### 1. 페이지 상태 (React State)

**usePageState.ts**:
- `sections`: Section[] - 모든 섹션과 아이템 포함
- `selectedSectionId`: string - 현재 선택된 섹션

**역할**: 페이지의 전체 구조와 데이터 관리

### 2. 그리드 정보 (Zustand)

**useGridStore.ts**:
```javascript
{
  cellWidth: number,       // 셀 너비 (px)
  cellHeight: number,      // 셀 높이 (px)
  gridCols: number,        // 그리드 컬럼 수 (12 or 24)
  isMobile: boolean,       // 모바일 여부
}
```

**역할**: 반응형 그리드 크기 정보 (여러 컴포넌트에서 구독)

### 3. 섹션/아이템 선택 상태 (Zustand)

**useSectionStore.ts**:
```javascript
{
  selectedSectionId: string,    // 선택된 섹션 ID
  selectedItemId: string | null // 선택된 아이템 ID
}
```

**역할**: UI 선택 상태 (하이라이트, 컬러 피커 등)

### 4. 드래그 앤 드롭 상태 (React State in Hook)

**useDragAndDrop.ts**:
```javascript
{
  draggedItemType: string | null,  // 드래그 중인 아이템 타입
  dragPreview: DragPreview | null  // 드래그 미리보기 정보
}
```

**역할**: LNB에서 캔버스로의 드래그 추적

### 5. 그리드 가시성 (React State in Hook)

**useGridVisibility.ts**:
```javascript
{
  gridVisibleSectionId: string | null  // 그리드가 보이는 섹션 ID
}
```

**역할**: 드래그 시 그리드 표시 여부 관리

### 6. 섹션 리사이즈 상태 (React State in Hook)

**useSectionResize.ts**:
```javascript
{
  resizingSectionId: string | null,  // 리사이즈 중인 섹션 ID
  resizeStartY: number,              // 리사이즈 시작 Y 좌표
  resizeStartHeight: number          // 리사이즈 시작 높이
}
```

**역할**: 섹션 리사이즈 진행 중 상태 추적

---

## 데이터 흐름

### 전체 데이터 흐름 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                    page.tsx (메인 페이지)                        │
│         usePageState, useDragAndDrop, 등 모든 훅 통합            │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
         ┌──────────────┐ ┌────────────┐ ┌─────────────┐
         │LeftNavBar    │ │  Canvas    │ │  RightBar   │
         │  - 클릭      │ │            │ │  (비어있음) │
         │  - 드래그시작 │ │ - Section  │ │             │
         └──────────────┘ │   배열     │ └─────────────┘
                          │   렌더링   │
                          └────────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │ Section1 │ │ Section2 │ │ Section3 │
              │ - Items  │ │ - Items  │ │ - Items  │
              │ - Grid   │ │ - Grid   │ │ - Grid   │
              └──────────┘ └──────────┘ └──────────┘
                    │
        ┌───────────┼───────────┬──────────┐
        │           │           │          │
    ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
    │ Button │ │  Text  │ │  Box   │ │GridCells │
    │ (Rnd)  │ │ (Rnd)  │ │ (Rnd)  │ │(배경)    │
    └────────┘ └────────┘ └────────┘ └──────────┘
```

### 상태 업데이트 흐름

#### 클릭으로 요소 추가:
```
LNB 버튼 클릭
  → onAddBox/onAddButton/onAddText 콜백
  → addItemAtPosition(selectedSectionId, type, 0, 0)
  → setSections (새 아이템 추가)
  → Canvas 리렌더링
  → ItemRenderer에서 새 Rnd 컴포넌트 생성
```

#### 드래그 앤 드롭으로 요소 추가:
```
LNB 버튼 드래그 시작
  → handleLNBDragStart (draggedItemType 저장)
  → Section 위에 드래그 오버
  → handleSectionDragOver
    ├─ 좌표 계산 (getGridCoordinatesFromEvent)
    ├─ 아이템 크기 조회 (ITEM_GRID_SIZE)
    └─ setDragPreview (미리보기 업데이트)
  → DragPreview 컴포넌트 렌더링
  → Section에 드롭
  → handleSectionDrop
    ├─ 최종 좌표 계산
    └─ addItemAtPosition 호출
  → 상태 업데이트 및 리렌더링
```

#### 아이템 드래그:
```
ItemRenderer의 Rnd 드래그 시작
  → onDragStart 콜백
  → setSelectedItemId
  → onToggleGridVisibility(true)
  → Grid 표시
  → Rnd 드래그 중
  → onDragStop 콜백
  ├─ 픽셀 좌표를 셀 좌표로 변환
  └─ onItemDragStop 호출
  → updateItemPosition (상태 업데이트)
  → 리렌더링
```

#### 섹션 리사이즈:
```
리사이즈 핸들 마우스 다운
  → handleResizeStart
  ├─ setResizingSectionId
  ├─ setResizeStartY
  └─ setResizeStartHeight
  → 전역 mousemove 리스너 등록
  → 마우스 이동 중
  → handleMouseMove
  ├─ 마우스 이동 거리 계산
  ├─ 행 단위 변화 계산
  └─ callback(newHeight)
  → updateSectionHeight (상태 업데이트)
  → Section 높이 재계산 (CSS Grid)
  → 마우스 업
  → handleMouseUp
  ├─ setResizingSectionId(null)
  └─ 리스너 제거
```

### Zustand 스토어의 역할

```
useGridDimensions (React State)
  ├─ cellWidth, cellHeight, gridCols, isMobile 계산
  └─ setGridDimensions (useGridStore 호출)

useGridStore (Zustand)
  ├─ cellWidth, cellHeight, gridCols, isMobile 저장
  └─ 여러 컴포넌트가 구독:
      ├─ Section (그리드 렌더링)
      ├─ ItemRenderer (아이템 위치/크기 계산)
      ├─ DragPreview (미리보기 위치/크기)
      └─ GridCells (셀 렌더링)

useSectionStore (Zustand)
  ├─ selectedSectionId 저장
  ├─ selectedItemId 저장
  └─ 여러 컴포넌트가 구독:
      ├─ Canvas (선택된 섹션 표시)
      ├─ ItemRenderer (선택된 아이템 하이라이트)
      └─ Section (컬러 피커 표시)
```

---

## 핵심 개념 정리

### 1. 좌표계 변환

```
마우스 이벤트 (절대 좌표)
  ↓ [getGridCoordinatesFromEvent]
그리드 셀 인덱스 (0, 1, 2, ...)
  ↓ [× (cellWidth + GAP)]
픽셀 위치 (px)
  ↓ [React 컴포넌트 렌더링]
화면 표시
```

### 2. 반응형 대응

```
화면 너비 < 768px
  ├─ gridCols = 12
  ├─ isMobile = true
  └─ item.style.mobile 사용

화면 너비 ≥ 768px
  ├─ gridCols = 24
  ├─ isMobile = false
  └─ item.style.desktop 사용
```

### 3. 스냅 그리드 계산

```
셀 크기 계산:
  cellWidth = 브라우저 렌더링 너비 (ResizeObserver)
  cellHeight = cellWidth / 1.6

드래그 스냅 그리드:
  dragGrid = [cellWidth + GAP, cellHeight + GAP]

좌표 변환:
  셀 인덱스 = Math.round(픽셀 좌표 / (cellSize + GAP))
```

### 4. 데이터 저장 구조

```
Page
├─ sections[]
│  ├─ Section
│  │  ├─ id (UUID)
│  │  ├─ height (행 단위)
│  │  ├─ backgroundColor
│  │  └─ items[]
│  │     ├─ Item
│  │     │  ├─ id (UUID)
│  │     │  ├─ type (button, text, box)
│  │     │  ├─ content (텍스트 아이템)
│  │     │  └─ style
│  │     │     ├─ desktop { position, width, height }
│  │     │     └─ mobile { position, width, height }
```

---

## 성능 최적화 포인트

1. **ResizeObserver**: 화면 크기 변경 감지 (효율적 리렌더링)
2. **Zustand**: 전역 상태 관리 (필요한 부분만 재구독)
3. **react-rnd**: 라이브러리의 dragGrid/resizeGrid (스냅 자동 처리)
4. **useCallback**: 콜백 함수 메모이제이션 (불필요한 재생성 방지)
5. **localStorage**: 클라이언트 캐시 (서버 요청 불필요)

---

## 라이브러리 역할

| 라이브러리 | 역할 | 관련 코드 |
|-----------|------|---------|
| **react** | UI 프레임워크 | 전체 |
| **next** | React 프레임워크 | app.tsx, layout.tsx |
| **zustand** | 전역 상태 관리 | store/*.ts |
| **react-rnd** | 드래그 & 리사이즈 | ItemRenderer.tsx |
| **uuid** | UUID 생성 | itemFactory.ts, usePageState.ts |
| **pixi.js** | 도형 렌더링 | PixiCanvas.tsx (분석 대상 아님) |
| **tailwindcss** | 스타일링 | 전체 className |

---

## 주요 상수

```javascript
// src/constants/grid.ts
CELL_ASPECT_RATIO = 1.6     // 셀 가로:세로 비율
GAP = 8                      // 셀 간 간격 (px)

// src/constants/itemConfig.ts
ITEM_CONFIG = {
  box: { desktop: { width: 2, height: 2 }, mobile: { width: 2, height: 2 } },
  button: { desktop: { width: 3, height: 2 }, mobile: { width: 2, height: 1 } },
  text: { desktop: { width: 2, height: 1 }, mobile: { width: 2, height: 1 } },
}

ITEM_GRID_SIZE = {
  box: { cellWidth: 2, cellHeight: 2 },
  button: { cellWidth: 3, cellHeight: 2 },
  text: { cellWidth: 2, cellHeight: 1 },
}
```

---

## 결론

이 프로젝트는 **반응형 그리드 기반 캔버스** 시스템으로, 다음의 핵심 메커니즘으로 작동합니다:

1. **마우스 좌표 → 그리드 셀 인덱스** 변환으로 스냅 구현
2. **셀 인덱스 저장** → 반응형 대응(mobile/desktop 분리)
3. **react-rnd로 드래그/리사이즈** 자동화
4. **localStorage에 JSON 저장** → 새로고침 후 복원
5. **Zustand로 반응형 그리드 정보 공유** → 모든 컴포넌트에서 일관된 크기 사용

모든 기능이 **픽셀 좌표 ↔ 그리드 좌표 변환**을 중심으로 설계되어 있으며, 이를 통해 반응형 레이아웃을 자동으로 지원합니다.
