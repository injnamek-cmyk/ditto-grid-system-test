import { v4 as uuidv4 } from "uuid";
import { Item } from "@/types/item";
import { ITEM_CONFIG, AddableItemType } from "@/constants/itemConfig";

/**
 * 주어진 타입과 위치로 새로운 아이템을 생성합니다.
 * @param type - 아이템 타입 (AddableItemType: "box" | "button" | "text")
 * @param x - 시작 X 좌표 (그리드 셀 단위)
 * @param y - 시작 Y 좌표 (그리드 셀 단위)
 * @returns 생성된 아이템
 */
export function createItem(
  type: AddableItemType,
  x: number = 0,
  y: number = 0
): Item {
  const config = ITEM_CONFIG[type];

  const item: Item = {
    id: uuidv4(),
    type,
    desktop: { x, y, ...config.desktop },
    mobile: { x, y, ...config.mobile },
  };

  // box 타입만 children 속성 추가
  if (type === "box") {
    item.children = [];
  }

  return item;
}
