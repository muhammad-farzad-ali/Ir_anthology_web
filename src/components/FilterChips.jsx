import "../App.css";

function FilterChips({ filters = {}, onRemove, onHover, onHoverLeave }) {
  const entries = Object.entries(filters || {});
  const hasFilters = entries.some(
    ([, values]) => Array.isArray(values) && values.length > 0
  );

  if (!hasFilters) return null;

  return (
    <div className="filter-chips">
      {entries.map(([key, values]) => (
        <div className="filter-group" key={key}>
          <span className="filter-label">{key}:</span>
          <div className="chip-row" id={`filter-chips-${key}`}>
            {(values || []).map((value) => (
              <button
                key={`${key}-${value}`}
                className="chip"
                onClick={() => onRemove(key, value)}
                onMouseOver={() => onHover?.(key, value)}
                onMouseLeave={onHoverLeave}
              >
                <span>{value}</span>
                <svg
                  className="chip-icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default FilterChips;
