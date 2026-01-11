import "../App.css";

function getSortArrow(header, isActive, order) {
  if (!isActive) {
    return (
      <svg
        className="sort-icon inactive"
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
        className="sort-icon"
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
      className="sort-icon"
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
    return <div className="table-empty">Loading data...</div>;
  }

  const headers = Object.keys(result[0] || {});

  return (
    <div className="table-wrapper">
      <div className="table-header">
        <table className="table-fixed">
          <thead>
            <tr>
              {headers.map((header) => {
                const isActive =
                  sorting?.order_by &&
                  sorting.order_by.toLowerCase() === header.toLowerCase();
                const isGrouped =
                  groupBy && groupBy.toLowerCase() === header.toLowerCase();
                const headerLabel =
                  header.charAt(0).toUpperCase() + header.slice(1);
                const widthStyle = isGrouped ? { width: 150 } : { width: 10 };

                if (isGrouped) {
                  return (
                    <th
                      key={header}
                      style={widthStyle}
                      className="group-header"
                    >
                      <div className="group-header-inner">
                        <button
                          onClick={() => onGroupByClick(header)}
                          onMouseOver={() => onGroupHover?.(header)}
                          onMouseLeave={onCellHoverLeave}
                          className="header-button"
                          title={`Group by ${headerLabel}`}
                        >
                          {headerLabel}
                        </button>
                        <button
                          onClick={() => onSortClick(header)}
                          onMouseOver={() => onSortHover?.(header)}
                          onMouseLeave={onCellHoverLeave}
                          className="sort-button"
                          title={`Sort by ${headerLabel}`}
                        >
                          {getSortArrow(header, isActive, sorting?.order)}
                        </button>
                        {selectedGroupedValues?.size > 0 && (
                          <button
                            onClick={onAddSelectedToFilters}
                            className="add-selected"
                            title="Add selected to filters"
                          >
                            Add ({selectedGroupedValues.size})
                          </button>
                        )}
                        {groupBy && (
                          <span className="result-count">
                            {result.length}{" "}
                            {result.length === 1 ? "result" : "results"}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                }

                return (
                  <th
                    key={header}
                    style={widthStyle}
                    className="vertical-header"
                  >
                    <div className="vertical-header-inner">
                      <button
                        onClick={() => onGroupByClick(header)}
                        onMouseOver={() => onGroupHover?.(header)}
                        onMouseLeave={onCellHoverLeave}
                        className="header-button"
                        title={`Group by ${headerLabel}`}
                      >
                        {headerLabel}
                      </button>
                      <button
                        onClick={() => onSortClick(header)}
                        onMouseOver={() => onSortHover?.(header)}
                        onMouseLeave={onCellHoverLeave}
                        className="sort-button"
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

      <div className="table-body">
        <table className="table-fixed">
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

                  if (isGrouped) {
                    return (
                      <td
                        key={`${rowIndex}-${header}`}
                        style={widthStyle}
                        className="group-cell"
                        onMouseOver={() =>
                          onCellHover?.(header, cellValue, row)
                        }
                        onMouseLeave={onCellHoverLeave}
                      >
                        <div className="group-cell-inner">
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

                  return (
                    <td
                      key={`${rowIndex}-${header}`}
                      style={widthStyle}
                      className="cell"
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
