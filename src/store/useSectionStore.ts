import { create } from "zustand";

export interface SectionState {
  // 선택된 섹션 ID
  selectedSectionId: string;
  // 선택된 아이템 ID (섹션 내)
  selectedItemId: string | null;

  // 선택된 섹션 설정 함수
  setSelectedSectionId: (sectionId: string) => void;
  // 선택된 아이템 설정 함수
  setSelectedItemId: (itemId: string | null) => void;
}

export const useSectionStore = create<SectionState>((set) => ({
  selectedSectionId: "",
  selectedItemId: null,

  setSelectedSectionId: (sectionId: string) =>
    set({ selectedSectionId: sectionId }),
  setSelectedItemId: (itemId: string | null) =>
    set({ selectedItemId: itemId }),
}));
