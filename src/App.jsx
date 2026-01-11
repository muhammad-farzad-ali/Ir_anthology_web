import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { postHoverEvent, postState } from "./api";
import EditorBar from "./components/EditorBar";
import FilterChips from "./components/FilterChips";
import DataTable from "./components/DataTable";
import Insights from "./components/Insights";

const initialAppState = {
  question: "",
  filters: {},
  group_by: null,
  sorting: {
    order_by: null,
    order: "asc",
    limit: 10,
    offset: 0,
  },
  comments: [],
  suggestions: [],
  result: [],
};

const initialHoverState = {
  cellHover: {
    columnName: "",
    cellValue: "",
    groupByColumn: "",
    groupByValue: "",
  },
  filterHover: {
    filterName: "",
    filterValue: "",
  },
  sortingHover: {
    columnName: "",
    arrowPosition: "",
  },
  groupbyHover: {
    columnName: "",
  },
};

function App() {
  const [appState, setAppState] = useState(initialAppState);
  const [questionDraft, setQuestionDraft] = useState("");
  const [selectedGroupedValues, setSelectedGroupedValues] = useState(
    () => new Set()
  );
  const [hoverEffectsEnabled, setHoverEffectsEnabled] = useState(false);
  const [hoverState, setHoverState] = useState(initialHoverState);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState("");
  const appStateRef = useRef(initialAppState);
  const isSyncingRef = useRef(false);

  const hasActiveFilters = useMemo(
    () =>
      appState.filters &&
      Object.values(appState.filters).some(
        (arr) => Array.isArray(arr) && arr.length > 0
      ),
    [appState.filters]
  );

  const shouldShowData = hasActiveFilters || (appState.result?.length ?? 0) > 0;
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

  const handleCellHover = useCallback(
    (header, value, row) => {
      if (!hoverEffectsEnabled) return;
      resetHoverState();
      const groupByKey = appState.group_by
        ? appState.group_by.charAt(0).toUpperCase() + appState.group_by.slice(1)
        : "";
      const groupedValue =
        groupByKey && row[groupByKey] ? row[groupByKey].toString() : "";
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

  const syncState = useCallback(async (nextState) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);
    setError("");
    const payload = nextState || appStateRef.current;
    const { data, error: syncError } = await postState(payload);
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

  const addSelectedToFilters = useCallback(async () => {
    if (!appState.group_by || selectedGroupedValues.size === 0) return;
    const groupByKey = appState.group_by.toLowerCase();
    const nextFilters = { ...(appState.filters || {}) };
    const existing = nextFilters[groupByKey]
      ? [...nextFilters[groupByKey]]
      : [];
    selectedGroupedValues.forEach((value) => {
      const numValue = Number(value);
      const filterValue =
        !Number.isNaN(numValue) && groupByKey === "years" ? numValue : value;
      if (!existing.includes(filterValue)) {
        existing.push(filterValue);
      }
    });
    nextFilters[groupByKey] = existing;
    const nextState = { ...appState, filters: nextFilters };
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

  const handleCellClickWithRow = useCallback(
    async (header, value, row) => {
      if (!value || value === "0") return;
      const filterKey = header.toLowerCase();
      const nextFilters = { ...(appState.filters || {}) };

      if (appState.group_by && appState.group_by.toLowerCase() !== filterKey) {
        const currentGroupByKey = appState.group_by.toLowerCase();
        const groupByKeyCapitalized =
          appState.group_by.charAt(0).toUpperCase() +
          appState.group_by.slice(1);
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
          const filterValue =
            !Number.isNaN(numValue) && currentGroupByKey === "years"
              ? numValue
              : currentGroupByValue;
          if (
            !arr.map((v) => v?.toString()).includes(filterValue?.toString())
          ) {
            arr.push(filterValue);
          }
          nextFilters[currentGroupByKey] = arr;
        }
      }

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
    <div className="w-full flex justify-center font-['Inter',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] leading-6 font-normal text-slate-900 bg-neutral-200">
      <div className="w-[92%] md:w-4/5 max-w-[1200px] pt-8 pb-12">
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
    </div>
  );
}

export default App;
