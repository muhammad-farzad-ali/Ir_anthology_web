import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { postHoverEvent, postState } from "./api";
import EditorBar from "./components/EditorBar";
import FilterChips from "./components/FilterChips";
import DataTable from "./components/DataTable";
import Insights from "./components/Insights";

// Initial state structure for the application
// This defines the data structure sent to/received from the backend
const initialAppState = {
  question: "", // User's query text
  filters: {}, // Active filters (e.g., {authors: ["John Doe"], years: [2020]})
  group_by: null, // Column to group results by
  sorting: {
    order_by: null, // Column to sort by
    order: "asc", // Sort direction: "asc" or "desc"
    limit: 10, // Number of results to display
    offset: 0, // Pagination offset
  },
  comments: [], // Backend-generated observations about the data
  suggestions: [], // Backend-generated follow-up question suggestions
  result: [], // Query results (array of data objects)
};

// Initial hover state structure
// Used to track what element the user is hovering over to generate contextual questions
const initialHoverState = {
  cellHover: {
    columnName: "", // The column being hovered
    cellValue: "", // The value of the cell being hovered
    groupByColumn: "", // Current groupBy column (if any)
    groupByValue: "", // The groupBy value for this row
  },
  filterHover: {
    filterName: "", // Filter category being hovered (e.g., "authors")
    filterValue: "", // Specific filter value being hovered
  },
  sortingHover: {
    columnName: "", // Column whose sort button is being hovered
    arrowPosition: "", // Current sort state: "asc", "desc", or "neutral"
  },
  groupbyHover: {
    columnName: "", // Column whose groupBy button is being hovered
  },
};

function App() {
  // Main application state synced with backend
  const [appState, setAppState] = useState(initialAppState);

  // Local draft of the question being edited (not yet submitted)
  const [questionDraft, setQuestionDraft] = useState("");

  // Set of selected checkbox values in grouped view (for batch operations)
  const [selectedGroupedValues, setSelectedGroupedValues] = useState(
    () => new Set()
  );

  // Toggle for hover effects feature (shows dynamic questions on hover)
  const [hoverEffectsEnabled, setHoverEffectsEnabled] = useState(false);

  // Current hover state to track what element is being hovered
  const [hoverState, setHoverState] = useState(initialHoverState);

  // Loading state during API calls
  const [isSyncing, setIsSyncing] = useState(false);

  // Error message to display to user
  const [error, setError] = useState("");

  // Refs to access latest state in callbacks without re-creating them
  const appStateRef = useRef(initialAppState);
  const isSyncingRef = useRef(false);

  // Check if any filters are active (at least one filter array has values)
  // Memoized to avoid recalculating on every render
  const hasActiveFilters = useMemo(
    () =>
      appState.filters &&
      Object.values(appState.filters).some(
        (arr) => Array.isArray(arr) && arr.length > 0
      ),
    [appState.filters]
  );

  // Show data table if filters are active OR if there are results
  const shouldShowData = hasActiveFilters || (appState.result?.length ?? 0) > 0;

  // Show insights section if there are comments or suggestions from backend
  const shouldShowInsights =
    (appState.comments?.length ?? 0) > 0 ||
    (appState.suggestions?.length ?? 0) > 0;

  const resetHoverState = useCallback(() => {
    if (!hoverEffectsEnabled) return;
    setHoverState(initialHoverState);
  }, [hoverEffectsEnabled]);

  const restoreOriginalQuestion = useCallback(() => {
    if (!hoverEffectsEnabled) return;
    setQuestionDraft(appState.question || "");
  }, [appState.question, hoverEffectsEnabled]);

  const sendHoverState = useCallback(
    async (nextHoverState) => {
      if (!hoverEffectsEnabled) return;
      setQuestionDraft("loading user question...");
      const payload = nextHoverState || hoverState;
      const { data, error: hoverError } = await postHoverEvent(payload);
      if (data?.message) {
        setQuestionDraft(data.message);
      }
      if (hoverError) {
        setQuestionDraft("Error loading question");
        setError(hoverError);
      }
    },
    [hoverEffectsEnabled, hoverState]
  );

  // Handle hovering over a table cell
  // Sends hover context to backend to generate a relevant question
  const handleCellHover = useCallback(
    (header, value, row) => {
      if (!hoverEffectsEnabled) return;
      resetHoverState();

      // Convert groupBy key to match the capitalized row property (e.g., "authors" -> "Authors")
      const groupByKey = appState.group_by
        ? appState.group_by.charAt(0).toUpperCase() + appState.group_by.slice(1)
        : "";
      const groupedValue =
        groupByKey && row[groupByKey] ? row[groupByKey].toString() : "";

      // Build hover state with cell context
      const nextHoverState = {
        ...initialHoverState,
        cellHover: {
          columnName: header,
          cellValue: value?.toString() ?? "",
          groupByColumn: appState.group_by || "",
          groupByValue: groupedValue,
        },
      };
      setHoverState(nextHoverState);
      sendHoverState(nextHoverState);
    },
    [appState.group_by, hoverEffectsEnabled, resetHoverState, sendHoverState]
  );

  const handleFilterHover = useCallback(
    (filterName, filterValue) => {
      if (!hoverEffectsEnabled) return;
      resetHoverState();
      const nextHoverState = {
        ...initialHoverState,
        filterHover: {
          filterName,
          filterValue,
        },
      };
      setHoverState(nextHoverState);
      sendHoverState(nextHoverState);
    },
    [hoverEffectsEnabled, resetHoverState, sendHoverState]
  );

  const handleSortHover = useCallback(
    (columnName) => {
      if (!hoverEffectsEnabled) return;
      resetHoverState();
      const isActive =
        appState.sorting.order_by &&
        appState.sorting.order_by.toLowerCase() === columnName.toLowerCase();
      const arrowPosition = isActive ? appState.sorting.order : "neutral";
      const nextHoverState = {
        ...initialHoverState,
        sortingHover: {
          columnName,
          arrowPosition,
        },
      };
      setHoverState(nextHoverState);
      sendHoverState(nextHoverState);
    },
    [
      appState.sorting.order,
      appState.sorting.order_by,
      hoverEffectsEnabled,
      resetHoverState,
      sendHoverState,
    ]
  );

  const handleGroupByHover = useCallback(
    (columnName) => {
      if (!hoverEffectsEnabled) return;
      resetHoverState();
      const nextHoverState = {
        ...initialHoverState,
        groupbyHover: { columnName },
      };
      setHoverState(nextHoverState);
      sendHoverState(nextHoverState);
    },
    [hoverEffectsEnabled, resetHoverState, sendHoverState]
  );

  // Sync state with backend API
  // Prevents concurrent sync requests using ref to avoid race conditions
  const syncState = useCallback(async (nextState) => {
    // Guard: prevent multiple simultaneous sync operations
    if (isSyncingRef.current) return;

    isSyncingRef.current = true;
    setIsSyncing(true);
    setError("");

    // Use provided state or fall back to current state from ref
    const payload = nextState || appStateRef.current;
    const { data, error: syncError } = await postState(payload);

    // Update local state with backend response
    if (data) {
      setAppState(data);
      setQuestionDraft(data.question || "");
      appStateRef.current = data;
    }

    if (syncError) {
      setError(syncError);
    }

    setIsSyncing(false);
    isSyncingRef.current = false;
  }, []);

  const removeFilterChip = useCallback(
    async (filterKey, value) => {
      const nextFilters = { ...(appState.filters || {}) };
      if (nextFilters[filterKey]) {
        nextFilters[filterKey] = nextFilters[filterKey].filter(
          (v) => v?.toString() !== value?.toString()
        );
        if (nextFilters[filterKey].length === 0) {
          delete nextFilters[filterKey];
        }
      }
      const nextState = { ...appState, filters: nextFilters };
      setAppState(nextState);
      await syncState(nextState);
    },
    [appState, syncState]
  );

  // Add selected checkboxes from grouped view to filters
  // Converts the Set of selected values into filter arrays
  const addSelectedToFilters = useCallback(async () => {
    if (!appState.group_by || selectedGroupedValues.size === 0) return;

    const groupByKey = appState.group_by.toLowerCase();
    const nextFilters = { ...(appState.filters || {}) };
    const existing = nextFilters[groupByKey]
      ? [...nextFilters[groupByKey]]
      : [];

    // Add each selected value to filters
    selectedGroupedValues.forEach((value) => {
      const numValue = Number(value);
      // Special handling: convert year strings to numbers
      const filterValue =
        !Number.isNaN(numValue) && groupByKey === "years" ? numValue : value;

      // Only add if not already in filters
      if (!existing.includes(filterValue)) {
        existing.push(filterValue);
      }
    });

    nextFilters[groupByKey] = existing;
    const nextState = { ...appState, filters: nextFilters };

    // Clear selection after adding to filters
    setSelectedGroupedValues(new Set());
    setAppState(nextState);
    await syncState(nextState);
  }, [appState, selectedGroupedValues, syncState]);

  const toggleGroupedValue = useCallback((value, checked) => {
    setSelectedGroupedValues((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(value.toString());
      } else {
        next.delete(value.toString());
      }
      return next;
    });
  }, []);

  const handleGroupByClick = useCallback(
    async (header) => {
      const nextState = {
        ...appState,
        group_by: header.toLowerCase(),
      };
      setAppState(nextState);
      await syncState(nextState);
    },
    [appState, syncState]
  );

  const handleSortClick = useCallback(
    async (header) => {
      const isActive =
        appState.sorting.order_by &&
        appState.sorting.order_by.toLowerCase() === header.toLowerCase();
      const nextSorting = {
        ...appState.sorting,
        order_by: header,
        order: isActive && appState.sorting.order === "asc" ? "desc" : "asc",
      };
      const nextState = { ...appState, sorting: nextSorting };
      setAppState(nextState);
      await syncState(nextState);
    },
    [appState, syncState]
  );

  // Handle clicking on a table cell
  // Complex logic: adds clicked value to filters AND preserves current group filter if switching groups
  const handleCellClickWithRow = useCallback(
    async (header, value, row) => {
      // Ignore empty or zero values
      if (!value || value === "0") return;

      const filterKey = header.toLowerCase();
      const nextFilters = { ...(appState.filters || {}) };

      // If we're grouped by a different column than the one clicked,
      // also add the current row's group value to filters
      // This preserves the current view context when drilling down
      if (appState.group_by && appState.group_by.toLowerCase() !== filterKey) {
        const currentGroupByKey = appState.group_by.toLowerCase();
        const groupByKeyCapitalized =
          appState.group_by.charAt(0).toUpperCase() +
          appState.group_by.slice(1);

        // Find the group value in the row (handles different capitalizations)
        const currentGroupByValue =
          row[groupByKeyCapitalized] ??
          row[
            Object.keys(row).find((k) => k.toLowerCase() === currentGroupByKey)
          ];

        if (currentGroupByValue !== undefined) {
          const arr = nextFilters[currentGroupByKey]
            ? [...nextFilters[currentGroupByKey]]
            : [];
          const numValue = Number(currentGroupByValue);
          // Convert years to numbers for proper filtering
          const filterValue =
            !Number.isNaN(numValue) && currentGroupByKey === "years"
              ? numValue
              : currentGroupByValue;

          // Add to filter if not already present
          if (
            !arr.map((v) => v?.toString()).includes(filterValue?.toString())
          ) {
            arr.push(filterValue);
          }
          nextFilters[currentGroupByKey] = arr;
        }
      }

      // Add the clicked cell value to filters
      const targetArray = nextFilters[filterKey]
        ? [...nextFilters[filterKey]]
        : [];
      const numValue = Number(value);
      const filterValue =
        !Number.isNaN(numValue) && filterKey === "years" ? numValue : value;

      if (
        !targetArray.map((v) => v?.toString()).includes(filterValue?.toString())
      ) {
        targetArray.push(filterValue);
      }
      nextFilters[filterKey] = targetArray;

      // Update state: add to filters AND change groupBy to clicked column
      const nextState = {
        ...appState,
        filters: nextFilters,
        group_by: filterKey,
      };
      setAppState(nextState);
      await syncState(nextState);
    },
    [appState, syncState]
  );

  const handleSuggestionClick = useCallback(
    async (suggestion) => {
      const plainText = suggestion.replace(/<[^>]*>/g, "");
      const nextState = { ...appState, question: plainText };
      setQuestionDraft(plainText);
      setAppState(nextState);
      window.scrollTo({ top: 0, behavior: "smooth" });
      await syncState(nextState);
    },
    [appState, syncState]
  );

  const toggleHoverEffects = useCallback(() => {
    setHoverEffectsEnabled((prev) => {
      const next = !prev;
      if (!next) {
        setQuestionDraft(appState.question || "");
      }
      return next;
    });
  }, [appState.question]);

  useEffect(() => {
    window.toggleHoverEffects = toggleHoverEffects;
  }, [toggleHoverEffects]);

  useEffect(() => {
    setQuestionDraft(appState.question || "");
  }, [appState.question]);

  useEffect(() => {
    appStateRef.current = appState;
  }, [appState]);

  useEffect(() => {
    syncState(initialAppState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full flex justify-center font-['Inter',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] leading-6 font-normal text-slate-900 bg-neutral-200 relative">
      <div
        className={`w-[92%] md:w-4/5 max-w-[1200px] pt-8 pb-12 ${
          isSyncing ? "blur-sm" : ""
        }`}
      >
        <EditorBar
          value={questionDraft}
          onChange={setQuestionDraft}
          onSubmit={async () => {
            if (!questionDraft.trim()) return;
            const nextState = { ...appState, question: questionDraft.trim() };
            setAppState(nextState);
            await syncState(nextState);
          }}
          isSyncing={isSyncing}
          hoverEnabled={hoverEffectsEnabled}
          onToggleHover={toggleHoverEffects}
        />

        {error && (
          <div className="bg-red-100 text-red-800 border border-red-300 rounded-xl py-3 px-3.5 mb-3 text-sm">
            {error}
          </div>
        )}

        {shouldShowData && (
          <div className="bg-white rounded-2xl shadow-[0_10px_25px_rgba(15,23,42,0.08)] px-6 pt-6 pb-3 mb-[18px]">
            <FilterChips
              filters={appState.filters}
              onRemove={removeFilterChip}
              onHover={handleFilterHover}
              onHoverLeave={restoreOriginalQuestion}
            />
            <DataTable
              result={appState.result}
              groupBy={appState.group_by}
              sorting={appState.sorting}
              selectedGroupedValues={selectedGroupedValues}
              onToggleGroupedValue={toggleGroupedValue}
              onAddSelectedToFilters={addSelectedToFilters}
              onGroupByClick={handleGroupByClick}
              onSortClick={handleSortClick}
              onCellClickWithRow={handleCellClickWithRow}
              onCellHover={handleCellHover}
              onCellHoverLeave={restoreOriginalQuestion}
              onSortHover={handleSortHover}
              onGroupHover={handleGroupByHover}
            />
          </div>
        )}

        {shouldShowInsights && (
          <div className="bg-white rounded-2xl shadow-[0_10px_25px_rgba(15,23,42,0.08)] p-6 mb-[18px]">
            <Insights
              comments={appState.comments}
              suggestions={appState.suggestions}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>
        )}
      </div>

      {/* Loading spinner overlay - shown during API requests */}
      {/* pointer-events-none allows clicking through the spinner to the blurred content */}
      {isSyncing && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
