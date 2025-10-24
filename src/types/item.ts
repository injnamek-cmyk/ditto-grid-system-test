export type ItemType = ShapeType | "box" | "button" | "text";

/**
 * LNB에서 추가 가능한 아이템 타입
 * Shape 타입들은 제외 (circle, triangle, rectangle)
 */
export type AddableItemType = "box" | "button" | "text" | "input_filed";

export type ItemStyleProps = {
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  fontSize?: number;
  fontWeight?: "normal" | "bold" | "semibold";
  textAlign?: "left" | "center" | "right";
  padding?: number;
  opacity?: number;
};

export type Item = {
  id: string;
  type?: AddableItemType;
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
