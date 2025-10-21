import { GAP } from "@/constants/grid";

/**
 * 마우스 이벤트로부터 그리드 셀 좌표를 계산합니다.
 * @param event - React DragEvent
 * @param sectionElement - 섹션 DOM 요소
 * @param cellWidth - 셀 너비 (px)
 * @param cellHeight - 셀 높이 (px)
 * @param gridCols - 그리드 컬럼 수
 * @param sectionHeight - 섹션 높이 (행 개수)
 * @returns 그리드 좌표 { x, y } 또는 null
 */
export const getGridCoordinatesFromEvent = (
  event: React.DragEvent<HTMLDivElement>,
  sectionElement: HTMLElement,
  cellWidth: number,
  cellHeight: number,
  gridCols: number,
  sectionHeight: number
): { x: number; y: number } | null => {
  if (cellWidth <= 0 || cellHeight <= 0) return null;

  // 섹션 내 그리드 컨테이너 찾기
  const gridContainer = sectionElement.querySelector(
    ".w-full.grid.grid-cols-12"
  ) as HTMLElement;
  if (!gridContainer) return null;

  // 그리드 컨테이너의 위치와 크기
  const gridRect = gridContainer.getBoundingClientRect();

  // 마우스 위치를 그리드 컨테이너 내 상대 좌표로 변환
  const relativeX = event.clientX - gridRect.left;
  const relativeY = event.clientY - gridRect.top;

  // 그리드 셀 좌표 계산
  const cellWithGap = cellWidth + GAP;
  const rowWithGap = cellHeight + GAP;

  let gridX = Math.floor(relativeX / cellWithGap);
  let gridY = Math.floor(relativeY / rowWithGap);

  // 바운더리 체크
  gridX = Math.max(0, Math.min(gridCols - 1, gridX));
  gridY = Math.max(0, Math.min(sectionHeight - 1, gridY));

  return { x: gridX, y: gridY };
};

/**
 * 그리드 셀 크기를 기반으로 픽셀 좌표를 계산합니다.
 * @param gridX - 그리드 X 좌표 (셀 단위)
 * @param gridY - 그리드 Y 좌표 (셀 단위)
 * @param cellWidth - 셀 너비 (px)
 * @param cellHeight - 셀 높이 (px)
 * @returns 픽셀 좌표 { x, y }
 */
export const getPixelFromGridCoordinates = (
  gridX: number,
  gridY: number,
  cellWidth: number,
  cellHeight: number
): { x: number; y: number } => {
  return {
    x: gridX * (cellWidth + GAP),
    y: gridY * (cellHeight + GAP),
  };
};

/**
 * 픽셀 크기를 셀 크기로 변환합니다.
 * @param pixelWidth - 픽셀 너비
 * @param pixelHeight - 픽셀 높이
 * @param cellWidth - 셀 너비 (px)
 * @param cellHeight - 셀 높이 (px)
 * @returns 셀 단위 크기 { width, height }
 */
export const getCellSizeFromPixel = (
  pixelWidth: number,
  pixelHeight: number,
  cellWidth: number,
  cellHeight: number
): { width: number; height: number } => {
  return {
    width: Math.round(pixelWidth / (cellWidth + GAP)),
    height: Math.round(pixelHeight / (cellHeight + GAP)),
  };
};

/**
 * 그리드 범위 내로 좌표와 크기를 클램프합니다.
 * @param x - X 좌표
 * @param y - Y 좌표
 * @param width - 너비 (셀 단위)
 * @param height - 높이 (셀 단위)
 * @param gridCols - 그리드 컬럼 수
 * @param sectionHeight - 섹션 높이 (행 개수)
 * @returns 클램프된 좌표와 크기
 */
export const clampToGrid = (
  x: number,
  y: number,
  width: number,
  height: number,
  gridCols: number,
  sectionHeight: number
): { x: number; y: number; width: number; height: number } => {
  const clampedX = Math.max(0, Math.min(gridCols - 1, x));
  const clampedY = Math.max(0, Math.min(sectionHeight - 1, y));
  const clampedWidth = Math.max(1, Math.min(gridCols - clampedX, width));
  const clampedHeight = Math.max(1, Math.min(sectionHeight - clampedY, height));

  return { x: clampedX, y: clampedY, width: clampedWidth, height: clampedHeight };
};
