import { create } from "zustand";

export interface GridState {
  // Layout 크기 정보
  cellWidth: number;
  cellHeight: number;
  gridCols: number;
  isMobile: boolean;

  // Layout 크기 설정 함수
  setGridDimensions: (
    cellWidth: number,
    cellHeight: number,
    gridCols: number,
    isMobile: boolean
  ) => void;
}

export const useGridStore = create<GridState>((set) => ({
  cellWidth: 0,
  cellHeight: 0,
  gridCols: 12,
  isMobile: true,

  setGridDimensions: (
    cellWidth: number,
    cellHeight: number,
    gridCols: number,
    isMobile: boolean
  ) => set({ cellWidth, cellHeight, gridCols, isMobile }),
}));
