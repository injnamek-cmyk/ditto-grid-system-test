export type ItemType = "default" | "circle" | "triangle" | "rectangle" | "button" | "text";

export type Item = {
  id: string;
  type?: ItemType;
  color?: string;
  desktop: { x: number; y: number; width: number; height: number };
  mobile: { x: number; y: number; width: number; height: number };
};

export type ShapeType = "circle" | "triangle" | "rectangle";

export type ShapeItem = Item & {
  type: ShapeType;
};
