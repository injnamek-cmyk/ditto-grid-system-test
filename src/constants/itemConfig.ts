import { AddableItemType } from "@/types/item";

/**
 * 아이템 타입별 기본 설정
 * desktop과 mobile 속성은 각 환경에서의 그리드 크기를 정의합니다.
 */
export const ITEM_CONFIG: Record<
  AddableItemType,
  {
    desktop: { width: number; height: number };
    mobile: { width: number; height: number };
  }
> = {
  box: {
    desktop: { width: 2, height: 2 },
    mobile: { width: 2, height: 2 },
  },
  button: {
    desktop: { width: 3, height: 2 },
    mobile: { width: 2, height: 1 },
  },
  text: {
    desktop: { width: 2, height: 1 },
    mobile: { width: 2, height: 1 },
  },
  input_filed: {
    desktop: { width: 4, height: 11 },
    mobile: { width: 4, height: 11 },
  },
} as const;

/**
 * 드래그&드롭 미리보기에서 사용되는 그리드 셀 크기
 */
export const ITEM_GRID_SIZE: Record<
  AddableItemType,
  { cellWidth: number; cellHeight: number }
> = {
  box: { cellWidth: 2, cellHeight: 2 },
  button: { cellWidth: 3, cellHeight: 2 },
  text: { cellWidth: 2, cellHeight: 1 },
  input_filed: { cellWidth: 4, cellHeight: 11 },
} as const;
