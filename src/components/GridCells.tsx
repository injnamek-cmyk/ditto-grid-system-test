interface GridCellsProps {
  gridCols: number;
  sectionHeight: number;
  gridVisibleSectionId: string | null;
  currentSectionId: string;
}

export default function GridCells({
  gridCols,
  sectionHeight,
  gridVisibleSectionId,
  currentSectionId,
}: GridCellsProps) {
  // 각 섹션별 그리드 셀 생성
  const sectionGridCells = Array.from(
    { length: gridCols * sectionHeight },
    (_, index) => {
      const row = Math.floor(index / gridCols);
      const col = index % gridCols;
      return {
        row,
        col,
        id: `section-${currentSectionId}-cell-${row}-${col}`,
      };
    }
  );

  return (
    <>
      {sectionGridCells.map((cell) => (
        <div
          key={cell.id}
          className={`transition-all duration-200 ${
            gridVisibleSectionId === currentSectionId
              ? "bg-slate-200/40"
              : "bg-transparent"
          }`}
          data-row={cell.row}
          data-col={cell.col}
        />
      ))}
    </>
  );
}
