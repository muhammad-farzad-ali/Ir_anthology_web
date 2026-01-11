function FilterChips({ filters = {}, onRemove, onHover, onHoverLeave }) {
  // Convert filters object to array of [key, values] pairs
  const entries = Object.entries(filters || {});

  // Check if there are any active filters (at least one array with values)
  const hasFilters = entries.some(
    ([, values]) => Array.isArray(values) && values.length > 0
  );

  // Don't render anything if no filters are active
  if (!hasFilters) return null;

  return (
    <div className="flex flex-col gap-3 mb-3">
      {entries.map(([key, values]) => {
        // Only render the filter category if it has values
        if (!Array.isArray(values) || values.length === 0) return null;

        return (
          <div className="flex gap-2.5 items-start" key={key}>
            <span className="capitalize font-semibold text-gray-900 pt-1.5">
              {key}:
            </span>
            <div className="flex flex-wrap gap-2" id={`filter-chips-${key}`}>
              {values.map((value) => (
                <button
                  key={`${key}-${value}`}
                  className="inline-flex items-center gap-1.5 border-none bg-gray-100 text-gray-900 rounded-full py-1.5 px-3 cursor-pointer text-sm hover:bg-gray-200"
                  onClick={() => onRemove(key, value)}
                  onMouseOver={() => onHover?.(key, value)}
                  onMouseLeave={onHoverLeave}
                >
                  <span>{value}</span>
                  <svg
                    className="w-3.5 h-3.5 text-gray-500"
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
        );
      })}
    </div>
  );
}

export default FilterChips;
