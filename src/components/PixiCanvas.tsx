"use client";

import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { ShapeItem } from "@/types/item";

type PixiCanvasProps = {
  sectionId: string;
  items: ShapeItem[];
  cellWidth: number;
  cellHeight: number;
  gap: number;
  gridCols: number;
  sectionHeight: number;
  isMobile: boolean;
  onShapeDragStart: (itemId: string) => void;
  onShapeDragEnd: (itemId: string, newX: number, newY: number) => void;
};

export default function PixiCanvas({
  items,
  cellWidth,
  cellHeight,
  gap,
  gridCols,
  sectionHeight,
  isMobile,
  onShapeDragStart,
  onShapeDragEnd,
}: PixiCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const shapesRef = useRef<Map<string, PIXI.Container>>(new Map());
  const [isAppReady, setIsAppReady] = useState(false);

  // Pixi.js 앱 초기화 (한 번만 실행)
  useEffect(() => {
    if (!canvasRef.current) return;

    let isMounted = true;

    // Pixi.js 앱 초기화
    const app = new PIXI.Application();

    (async () => {
      await app.init({
        width: 800,
        height: 600,
        backgroundColor: 0x000000,
        backgroundAlpha: 0,
        antialias: true,
        resizeTo: canvasRef.current || undefined,
      });

      if (isMounted && canvasRef.current) {
        appRef.current = app;
        canvasRef.current.appendChild(app.canvas);
        setIsAppReady(true); // 앱이 준비되었음을 알림
      } else {
        // 컴포넌트가 이미 언마운트된 경우
        app.destroy(true, { children: true, texture: true });
      }
    })();

    return () => {
      isMounted = false;
      setIsAppReady(false);
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
      shapesRef.current.clear();
    };
  }, []); // 한 번만 실행

  // 캔버스 크기 조정
  useEffect(() => {
    if (!appRef.current || !isAppReady || cellWidth === 0 || cellHeight === 0)
      return;

    const app = appRef.current;
    const newWidth = gridCols * (cellWidth + gap) - gap;
    const newHeight = sectionHeight * (cellHeight + gap) - gap;

    app.renderer.resize(newWidth, newHeight);
  }, [cellWidth, cellHeight, gap, gridCols, sectionHeight, isAppReady]);

  // 아이템 업데이트
  useEffect(() => {
    if (!appRef.current || !isAppReady || cellWidth === 0 || cellHeight === 0)
      return;

    const app = appRef.current;

    // 도형 생성 함수 (useEffect 내부에서 정의하여 최신 cellWidth/cellHeight 참조)
    const createShape = (item: ShapeItem): PIXI.Graphics => {
      const graphics = new PIXI.Graphics();
      const currentItem = isMobile ? item.style.mobile : item.style.desktop;
      const color = item.color
        ? parseInt(item.color.replace("#", ""), 16)
        : 0x3b82f6;

      const width =
        currentItem.width * cellWidth + (currentItem.width - 1) * gap;
      const height =
        currentItem.height * cellHeight + (currentItem.height - 1) * gap;

      switch (item.type) {
        case "circle":
          const radius = Math.min(width, height) / 2;
          graphics.circle(width / 2, height / 2, radius);
          graphics.fill(color);
          break;

        case "triangle":
          graphics.moveTo(width / 2, 0);
          graphics.lineTo(width, height);
          graphics.lineTo(0, height);
          graphics.lineTo(width / 2, 0);
          graphics.fill(color);
          break;

        case "rectangle":
          graphics.rect(0, 0, width, height);
          graphics.fill(color);
          break;

        default:
          // default 타입은 렌더링하지 않음 (기존 Rnd 사용)
          break;
      }

      return graphics;
    };

    // 기존 도형 제거
    shapesRef.current.forEach((container, id) => {
      if (!items.find((item) => item.id === id)) {
        app.stage.removeChild(container);
        shapesRef.current.delete(id);
      }
    });

    // 도형 추가 또는 업데이트
    items.forEach((item) => {
      const currentItem = isMobile ? item.style.mobile : item.style.desktop;
      const container = shapesRef.current.get(item.id);

      if (!container) {
        // 새 도형 생성
        const newContainer = new PIXI.Container();
        newContainer.eventMode = "static";
        newContainer.cursor = "pointer";

        const graphics = createShape(item);
        newContainer.addChild(graphics);

        // 드래그 기능
        let dragData: { x: number; y: number } | null = null;

        const handleDragEnd = () => {
          if (dragData) {
            // 그리드에 스냅
            const snapX = Math.round(newContainer.x / (cellWidth + gap));
            const snapY = Math.round(newContainer.y / (cellHeight + gap));
            newContainer.x = snapX * (cellWidth + gap);
            newContainer.y = snapY * (cellHeight + gap);

            onShapeDragEnd(item.id, snapX, snapY);
            dragData = null;
          }
        };

        newContainer.on("pointerdown", (event: PIXI.FederatedPointerEvent) => {
          const pos = event.global;
          dragData = { x: pos.x - newContainer.x, y: pos.y - newContainer.y };
          onShapeDragStart(item.id);
        });

        newContainer.on("pointermove", (event: PIXI.FederatedPointerEvent) => {
          if (dragData) {
            const pos = event.global;
            newContainer.x = pos.x - dragData.x;
            newContainer.y = pos.y - dragData.y;
          }
        });

        newContainer.on("pointerup", handleDragEnd);
        newContainer.on("pointerupoutside", handleDragEnd);

        // 초기 위치 설정
        newContainer.x = currentItem.position.x * (cellWidth + gap);
        newContainer.y = currentItem.position.y * (cellHeight + gap);

        app.stage.addChild(newContainer);
        shapesRef.current.set(item.id, newContainer);
      } else {
        // 기존 도형 업데이트 - 그래픽만 교체
        container.removeChildren();
        const graphics = createShape(item);
        container.addChild(graphics);

        // 위치 업데이트
        container.x = currentItem.position.x * (cellWidth + gap);
        container.y = currentItem.position.y * (cellHeight + gap);
      }
    });
  }, [
    items,
    cellWidth,
    cellHeight,
    gap,
    isMobile,
    isAppReady,
    onShapeDragStart,
    onShapeDragEnd,
  ]);

  return (
    <div
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ pointerEvents: "auto" }}
    />
  );
}
