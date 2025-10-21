import { create } from "zustand";

export interface SectionState {
  // 선택된 섹션 ID
  selectedSectionId: string;

  // 선택된 섹션 설정 함수
  setSelectedSectionId: (sectionId: string) => void;
}

export const useSectionStore = create<SectionState>((set) => ({
  selectedSectionId: "",

  setSelectedSectionId: (sectionId: string) =>
    set({ selectedSectionId: sectionId }),
}));
