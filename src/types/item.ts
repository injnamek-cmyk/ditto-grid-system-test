export type ItemType = "box" | ShapeType | "button" | "text";

/**
 * LNB에서 추가 가능한 아이템 타입
 * Shape 타입들은 제외 (circle, triangle, rectangle)
 */
export type AddableItemType = "box" | "button" | "text";

export type ItemStyleProps = {
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
};

export type Item = {
  id: string;
  type?: ItemType;
  color?: string;
  content?: string; // 텍스트 아이템의 내용
  style: {
    desktop: ItemStyleProps;
    mobile: ItemStyleProps;
  };
  children?: [];
};

export type ShapeType = "circle" | "triangle" | "rectangle";

export type ShapeItem = Item & {
  type: ShapeType;
};
