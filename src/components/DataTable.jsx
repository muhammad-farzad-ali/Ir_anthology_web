// Returns the appropriate sort arrow icon based on sort state
// - Neutral (gray): column is not being sorted
// - Up arrow: ascending sort
// - Down arrow: descending sort
function getSortArrow(header, isActive, order) {
  // Neutral state: show double arrow (both up and down)
  if (!isActive) {
    return (
      <svg
        className="w-3.5 h-3.5 text-gray-400"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (order === "asc") {
    return (
      <svg
        className="w-3.5 h-3.5 text-slate-900"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <svg
      className="w-3.5 h-3.5 text-slate-900"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DataTable({
  result = [],
  groupBy,
  sorting,
  selectedGroupedValues,
  onToggleGroupedValue,
  onAddSelectedToFilters,
  onGroupByClick,
  onSortClick,
  onCellClickWithRow,
  onCellHover,
  onCellHoverLeave,
  onSortHover,
  onGroupHover,
}) {
  if (!result || result.length === 0) {
    return <div className="text-sm text-gray-500">Loading data...</div>;
  }

  const headers = Object.keys(result[0] || {});

  return (
    <div className="w-full">
      {/* Fixed header table - kept separate from body for styling */}
      <div className="overflow-hidden">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr className="border-b border-gray-200">
              {headers.map((header) => {
                const isActive =
                  sorting?.order_by &&
                  sorting.order_by.toLowerCase() === header.toLowerCase();
                const isGrouped =
                  groupBy && groupBy.toLowerCase() === header.toLowerCase();
                const headerLabel =
                  header.charAt(0).toUpperCase() + header.slice(1);
                const widthStyle = isGrouped ? { width: 150 } : { width: 10 };

                // Grouped column: horizontal layout with Add button and result count
                if (isGrouped) {
                  return (
                    <th
                      key={header}
                      style={widthStyle}
                      className="px-2 pb-2.5 align-bottom h-[100px] border-b border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onGroupByClick(header)}
                          onMouseOver={() => onGroupHover?.(header)}
                          onMouseLeave={onCellHoverLeave}
                          className="border-none bg-transparent text-slate-900 font-bold text-sm cursor-pointer hover:text-gray-900"
                          title={`Group by ${headerLabel}`}
                        >
                          {headerLabel}
                        </button>
                        <button
                          onClick={() => onSortClick(header)}
                          onMouseOver={() => onSortHover?.(header)}
                          onMouseLeave={onCellHoverLeave}
                          className="border-none bg-transparent p-1 rounded-lg cursor-pointer hover:bg-gray-100"
                          title={`Sort by ${headerLabel}`}
                        >
                          {getSortArrow(header, isActive, sorting?.order)}
                        </button>
                        {selectedGroupedValues?.size > 0 && (
                          <button
                            onClick={onAddSelectedToFilters}
                            className="bg-gray-900 text-white border-none py-1 px-2 rounded-lg text-xs cursor-pointer hover:bg-[#0b1224]"
                            title="Add selected to filters"
                          >
                            Add ({selectedGroupedValues.size})
                          </button>
                        )}
                        {groupBy && (
                          <span className="text-xs text-gray-600 font-semibold">
                            {result.length}{" "}
                            {result.length === 1 ? "result" : "results"}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                }

                // Non-grouped column: rotated -30deg label to save horizontal space
                return (
                  <th
                    key={header}
                    style={widthStyle}
                    className="px-1.5 pb-2.5 align-bottom h-[100px] border-b border-gray-200 relative"
                  >
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 -rotate-[30deg] origin-bottom-left whitespace-nowrap">
                      <button
                        onClick={() => onGroupByClick(header)}
                        onMouseOver={() => onGroupHover?.(header)}
                        onMouseLeave={onCellHoverLeave}
                        className="border-none bg-transparent text-slate-900 font-bold text-sm cursor-pointer hover:text-gray-900"
                        title={`Group by ${headerLabel}`}
                      >
                        {headerLabel}
                      </button>
                      <button
                        onClick={() => onSortClick(header)}
                        onMouseOver={() => onSortHover?.(header)}
                        onMouseLeave={onCellHoverLeave}
                        className="border-none bg-transparent p-1 rounded-lg cursor-pointer hover:bg-gray-100"
                        title={`Sort by ${headerLabel}`}
                      >
                        {getSortArrow(header, isActive, sorting?.order)}
                      </button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
        </table>
      </div>

      {/* Scrollable table body with max height */}
      <div className="max-h-96 overflow-y-auto">
        <table className="w-full border-collapse table-fixed">
          <tbody>
            {result.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header) => {
                  const isGrouped =
                    groupBy && groupBy.toLowerCase() === header.toLowerCase();
                  const widthStyle = isGrouped ? { width: 150 } : { width: 10 };
                  const cellValue = row[header];
                  const isChecked = selectedGroupedValues?.has(
                    cellValue?.toString()
                  );

                  // Grouped column: render with checkbox for selection
                  if (isGrouped) {
                    return (
                      <td
                        key={`${rowIndex}-${header}`}
                        style={widthStyle}
                        className="py-3 px-2 text-sm text-gray-900 align-top border-b border-gray-200 hover:bg-slate-50"
                        onMouseOver={() =>
                          onCellHover?.(header, cellValue, row)
                        }
                        onMouseLeave={onCellHoverLeave}
                      >
                        <div className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(isChecked)}
                            onChange={(e) =>
                              onToggleGroupedValue(cellValue, e.target.checked)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span
                            onClick={() =>
                              onCellClickWithRow(header, cellValue, row)
                            }
                          >
                            {cellValue}
                          </span>
                        </div>
                      </td>
                    );
                  }

                  // Regular (non-grouped) cell: clickable to add to filters
                  return (
                    <td
                      key={`${rowIndex}-${header}`}
                      style={widthStyle}
                      className="py-3 text-sm text-gray-900 align-top cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap border-b border-gray-200 hover:bg-slate-50"
                      onClick={() => onCellClickWithRow(header, cellValue, row)}
                      onMouseOver={() => onCellHover?.(header, cellValue, row)}
                      onMouseLeave={onCellHoverLeave}
                      title={`${header}: ${cellValue}`}
                    >
                      {cellValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
