import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Item } from "@/types/item";
import { AddableItemType } from "@/types/item";
import { createItem } from "@/lib/itemFactory";
import { ITEM_CONFIG } from "@/constants/itemConfig";

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

interface UsePageStateReturn {
  sections: Section[];
  selectedSectionId: string;
  addSection: () => void;
  addItemToSelectedSection: (type: AddableItemType) => void;
  setSelectedSectionId: (id: string) => void;
  changeSectionBackgroundColor: (sectionId: string, color: string) => void;
  updateItemPosition: (
    sectionId: string,
    itemId: string,
    newX: number,
    newY: number,
    sectionHeight: number,
    isMobile: boolean,
    gridCols: number
  ) => void;
  updateItemSize: (
    sectionId: string,
    itemId: string,
    newX: number,
    newY: number,
    newWidth: number,
    newHeight: number,
    sectionHeight: number,
    isMobile: boolean,
    gridCols: number
  ) => void;
  addItemAtPosition: (
    sectionId: string,
    type: AddableItemType,
    x: number,
    y: number
  ) => void;
  updateSectionHeight: (sectionId: string, newHeight: number) => void;
  updateItemContent: (
    sectionId: string,
    itemId: string,
    content: string
  ) => void;
  savePage: () => void;
  deleteItem: (sectionId: string, itemId: string) => void;
}

/**
 * 페이지 상태와 섹션, 아이템 관리를 하는 커스텀 훅
 * @returns 페이지 상태와 업데이트 함수들
 */
export const usePageState = (): UsePageStateReturn => {
  const initialSectionId = uuidv4();

  const [sections, setSections] = useState<Section[]>([
    {
      id: initialSectionId,
      height: 24,
      backgroundColor: "#ffffff",
      items: [],
    },
  ]);

  const [selectedSectionId, setSelectedSectionId] =
    useState<string>(initialSectionId);

  // 앱 시작 시 로컬 스토리지에서 페이지 데이터 불러오기
  useEffect(() => {
    if (typeof window === "undefined") return; // SSR 환경에서 스킵

    const savedPage = localStorage.getItem("gridPage");
    if (savedPage) {
      try {
        const page: Page = JSON.parse(savedPage);
        setSections(page.sections);
        if (page.sections.length > 0) {
          setSelectedSectionId(page.sections[0].id);
        }
      } catch (error) {
        console.error("페이지 데이터 불러오기 실패:", error);
      }
    }
  }, []);

  // 섹션 추가
  const addSection = useCallback(() => {
    const newSection: Section = {
      id: uuidv4(),
      height: 24,
      backgroundColor: "#ffffff",
      items: [],
    };
    setSections((prev) => [...prev, newSection]);
  }, []);

  // 선택된 섹션에 아이템 추가
  const addItemToSelectedSection = useCallback(
    (type: AddableItemType) => {
      const newItem = createItem(type);
      setSections((prev) =>
        prev.map((s) =>
          s.id === selectedSectionId
            ? { ...s, items: [...s.items, newItem] }
            : s
        )
      );
    },
    [selectedSectionId]
  );

  // 특정 위치에 아이템 추가
  const addItemAtPosition = useCallback(
    (sectionId: string, type: AddableItemType, x: number, y: number) => {
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

      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
        )
      );
    },
    []
  );

  const deleteItem = (sectionId: string, itemId: string) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;

        return {
          ...section,
          items: section.items.filter((item) => item.id !== itemId),
        };
      })
    );
  };

  // 섹션 배경색 변경
  const changeSectionBackgroundColor = useCallback(
    (sectionId: string, color: string) => {
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId ? { ...s, backgroundColor: color } : s
        )
      );
    },
    []
  );

  // 아이템 위치 업데이트
  const updateItemPosition = useCallback(
    (
      sectionId: string,
      itemId: string,
      newX: number,
      newY: number,
      sectionHeight: number,
      isMobile: boolean,
      gridCols: number
    ) => {
      setSections((prev) =>
        prev.map((section) => {
          if (section.id !== sectionId) return section;

          return {
            ...section,
            items: section.items.map((i) => {
              if (i.id !== itemId) return i;

              const clampedX = Math.max(0, Math.min(gridCols - 1, newX));
              const clampedY = Math.max(0, Math.min(sectionHeight - 1, newY));

              if (isMobile) {
                return {
                  ...i,
                  style: {
                    ...i.style,
                    mobile: {
                      ...i.style.mobile,
                      position: { x: clampedX, y: clampedY },
                    },
                  },
                };
              } else {
                return {
                  ...i,
                  style: {
                    ...i.style,
                    desktop: {
                      ...i.style.desktop,
                      position: { x: clampedX, y: clampedY },
                    },
                  },
                };
              }
            }),
          };
        })
      );
    },
    []
  );

  // 아이템 크기 및 위치 업데이트
  const updateItemSize = useCallback(
    (
      sectionId: string,
      itemId: string,
      newX: number,
      newY: number,
      newWidth: number,
      newHeight: number,
      sectionHeight: number,
      isMobile: boolean,
      gridCols: number
    ) => {
      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== sectionId) return s;

          return {
            ...s,
            items: s.items.map((i) => {
              if (i.id !== itemId) return i;

              const clampedX = Math.max(0, Math.min(gridCols - 1, newX));
              const clampedY = Math.max(0, Math.min(sectionHeight - 1, newY));
              const clampedWidth = Math.max(
                1,
                Math.min(gridCols - newX, newWidth)
              );
              const clampedHeight = Math.max(
                1,
                Math.min(sectionHeight - newY, newHeight)
              );

              if (isMobile) {
                return {
                  ...i,
                  style: {
                    ...i.style,
                    mobile: {
                      position: { x: clampedX, y: clampedY },
                      width: clampedWidth,
                      height: clampedHeight,
                    },
                  },
                };
              } else {
                return {
                  ...i,
                  style: {
                    ...i.style,
                    desktop: {
                      position: { x: clampedX, y: clampedY },
                      width: clampedWidth,
                      height: clampedHeight,
                    },
                  },
                };
              }
            }),
          };
        })
      );
    },
    []
  );

  // 섹션 높이 업데이트
  const updateSectionHeight = useCallback(
    (sectionId: string, newHeight: number) => {
      setSections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, height: newHeight } : s))
      );
    },
    []
  );

  // 아이템 콘텐츠(텍스트) 업데이트
  const updateItemContent = useCallback(
    (sectionId: string, itemId: string, content: string) => {
      setSections((prev) =>
        prev.map((section) => {
          if (section.id !== sectionId) return section;

          return {
            ...section,
            items: section.items.map((i) => {
              if (i.id !== itemId) return i;
              return { ...i, content };
            }),
          };
        })
      );
    },
    []
  );

  // 페이지 저장
  const savePage = useCallback(() => {
    const page: Page = {
      id: uuidv4(),
      sections,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem("gridPage", JSON.stringify(page));
    alert("페이지가 저장되었습니다!");
  }, [sections]);

  return {
    sections,
    selectedSectionId,
    addSection,
    deleteItem,
    addItemToSelectedSection,
    setSelectedSectionId,
    changeSectionBackgroundColor,
    updateItemPosition,
    updateItemSize,
    addItemAtPosition,
    updateSectionHeight,
    updateItemContent,
    savePage,
  };
};
