import { ITEM_CONFIG } from "@/constants/itemConfig";
import { createItem } from "@/lib/itemFactory";
import { AddableItemType, Item } from "@/types/item";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";

/**
 * ========================
 * 타입 정의
 * ========================
 */
export type Section = {
  id: string;
  height: number;
  backgroundColor: string;
  items: Item[];
};

export type Page = {
  id: string;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
};

interface PageState {
  // 구조적 데이터
  sections: Section[];

  // 선택 상태
  selectedSectionId: string;
  selectedItemId: string | null;

  // 임시 UI 상태
  gridVisibleSectionId: string | null;
  resizingSectionId: string | null;

  // 아이템 CRUD 관련 액션 메서드
  addSection: () => void;
  deleteSection: (sectionId: string) => void;
  updateSection: (
    sectionId: string,
    updater: (section: Section) => Section
  ) => void;

  addItemToSelectedSection: (type: AddableItemType) => void;
  addItemAtPosition: (
    sectionId: string,
    type: AddableItemType,
    x: number,
    y: number
  ) => void;
  deleteItem: (sectionId: string, itemId: string) => void;
  updateItem: (
    sectionId: string,
    itemId: string,
    updater: (item: Item) => Item
  ) => void;

  savePage: () => void;

  // 선택 상태 액션
  setSelectedSectionId: (id: string) => void;
  setSelectedItemId: (id: string | null) => void;
  clearSection: () => void;

  // UI 상태 액션
  showGrid: (sectionId: string) => void;
  hideGrid: () => void;
  setResizingSectionId: (id: string | null) => void;
}

// 첫 섹션 ID
const initialSectionId = uuidv4();

// store 정의
export const usePageStore = create<PageState>((set) => {
  // 초기 sections 로드
  const loadInitialSections = (): Section[] => {
    // SSR 환경 체크 : 로컬에서 안 가져오고 그냥 default 만들어서 반환 (API 붙인 후 삭제 예정)
    if (typeof window === "undefined") {
      // default 값 반환
      return [
        {
          id: initialSectionId,
          height: 24,
          backgroundColor: "#ffffff",
          items: [],
        },
      ];
    }

    // 저장된 페이지가 있다면 반환
    const savedPage = localStorage.getItem("gridPage");
    if (savedPage) {
      try {
        const page: Page = JSON.parse(savedPage);
        return page.sections;
      } catch (error) {
        console.error(error);
      }
    }
    return [
      {
        id: uuidv4(),
        height: 24,
        backgroundColor: "#ffffff",
        items: [],
      },
    ];
  };

  return {
    // 상태 값
    sections: loadInitialSections(),
    selectedSectionId: initialSectionId,
    selectedItemId: null,
    gridVisibleSectionId: null,
    resizingSectionId: null,

    // 데이터 액션
    addSection() {
      set((state) => ({
        sections: [
          ...state.sections,
          {
            id: uuidv4(),
            height: 24,
            backgroundColor: "#ffffff",
            items: [],
          },
        ],
      }));
    },

    deleteSection(sectionId) {
      set((state) => ({
        sections: state.sections.filter((s) => s.id !== sectionId),
        selectedSectionId:
          state.selectedSectionId === sectionId
            ? state.sections[0]?.id || ""
            : state.selectedSectionId,
      }));
    },
    /**
     * 섹션의 속성을 업데이트합니다.
     * @param sectionId - 업데이트할 섹션 ID
     * @param updater - 섹션을 받아 수정된 섹션을 반환하는 함수
     *
     * @example
     * // 배경색 변경
     * updateSection(sectionId, (section) => ({
     *   ...section,
     *   backgroundColor: "#ff0000"
     * }));
     *
     * @example
     * // 높이 변경
     * updateSection(sectionId, (section) => ({
     *   ...section,
     *   height: 30
     * }));
     *
     * @example
     * // 여러 속성 동시 변경
     * updateSection(sectionId, (section) => ({
     *   ...section,
     *   backgroundColor: "#ff0000",
     *   height: 30
     * }));
     */
    updateSection(sectionId, updater) {
      set((state) => ({
        sections: state.sections.map((section) =>
          section.id === sectionId ? updater(section) : section
        ),
      }));
    },

    addItemToSelectedSection(type) {
      set((state) => ({
        sections: state.sections.map((s) =>
          s.id === state.selectedSectionId
            ? { ...s, items: [...s.items, createItem(type)] }
            : s
        ),
      }));
    },

    addItemAtPosition(sectionId, type, x, y) {
      const newItem: Item = {
        id: uuidv4(),
        type: type,
        style: {
          desktop: {
            position: { x, y },
            ...ITEM_CONFIG[type].desktop,
          },
          mobile: {
            position: { x, y },
            ...ITEM_CONFIG[type].mobile,
          },
        },
      };

      if (type === "box") {
        newItem.children = [];
      }

      set((state) => ({
        sections: state.sections.map((s) =>
          s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
        ),
      }));
    },

    deleteItem(sectionId, itemId) {
      set((state) => ({
        sections: state.sections.map((section) => {
          if (section.id !== sectionId) return section;

          return {
            ...section,
            items: section.items.filter((item) => item.id !== itemId),
          };
        }),
        selectedItemId:
          state.selectedItemId === itemId ? null : state.selectedItemId,
      }));
    },

    /**
     * 아이템의 속성을 업데이트합니다.
     * @param sectionId - 아이템이 속한 섹션 ID
     * @param itemId - 업데이트할 아이템 ID
     * @param updater - 아이템을 받아 수정된 아이템을 반환하는 함수
     *
     * @example
     * // 위치 변경 (데스크톱)
     * updateItem(sectionId, itemId, (item) => ({
     *   ...item,
     *   style: {
     *     ...item.style,
     *     desktop: {
     *       ...item.style.desktop,
     *       position: { x: newX, y: newY }
     *     }
     *   }
     * }));
     *
     * @example
     * // 크기 변경 (데스크톱)
     * updateItem(sectionId, itemId, (item) => ({
     *   ...item,
     *   style: {
     *     ...item.style,
     *     desktop: {
     *       ...item.style.desktop,
     *       width: newWidth,
     *       height: newHeight
     *     }
     *   }
     * }));
     *
     * @example
     * // 콘텐츠 변경
     * updateItem(sectionId, itemId, (item) => ({
     *   ...item,
     *   content: "New content"
     * }));
     */
    updateItem(sectionId, itemId, updater) {
      set((state) => ({
        sections: state.sections.map((section) => {
          if (section.id !== sectionId) return section;

          return {
            ...section,
            items: section.items.map((item) =>
              item.id === itemId ? updater(item) : item
            ),
          };
        }),
      }));
    },

    savePage() {
      set((state) => {
        const page: Page = {
          id: uuidv4(),
          sections: state.sections,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem("gridPage", JSON.stringify(page));
        alert("페이지가 저장되었습니다.");

        return state;
      });
    },

    // 선택 상태 액션
    setSelectedSectionId(id) {
      set({ selectedSectionId: id });
    },
    setSelectedItemId(id) {
      set({ selectedItemId: id });
    },
    clearSection() {
      set({ selectedSectionId: "", selectedItemId: null });
    },

    // UI 상태 액션
    showGrid(sectionId) {
      set({ gridVisibleSectionId: sectionId });
    },
    hideGrid() {
      set({ gridVisibleSectionId: null });
    },
    setResizingSectionId(id) {
      set({ resizingSectionId: id });
    },
  };
});
