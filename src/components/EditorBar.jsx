import { useEffect, useRef } from "react";

function EditorBar({
  value,
  onChange,
  onSubmit,
  isSyncing,
  hoverEnabled,
  onToggleHover,
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea based on content
  // Resets height to auto, then sets it to scrollHeight to fit content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleInput = (e) => {
    onChange(e.target.value);
  };

  // Submit on Cmd/Ctrl + Enter keyboard shortcut
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="sticky top-0 z-40 grid grid-cols-[1fr_auto] md:grid-cols-[auto_1fr_auto] grid-rows-[auto_auto] md:grid-rows-1 gap-y-2 md:gap-y-0 items-center gap-x-2.5 p-3 mx-auto mb-5 bg-neutral-100 rounded-[28px] shadow-[0_8px_18px_rgba(0,0,0,0.08)]">
      <button
        className="h-9 w-9 border-none rounded-full flex items-center justify-center bg-transparent text-gray-500 cursor-pointer hover:bg-black/5 hidden md:flex"
        aria-label="Add"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div className="max-h-52 overflow-y-auto col-span-2 md:col-span-1">
        <textarea
          ref={textareaRef}
          className="w-full border-none bg-transparent resize-none text-base leading-6 text-slate-900 outline-none py-1 px-2 placeholder:text-gray-400"
          placeholder="Ask anything"
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          className={`border rounded-[10px] py-1.5 px-2.5 cursor-pointer text-[13px] ${
            hoverEnabled
              ? "bg-gray-900 text-white border-gray-900"
              : "border-neutral-300 bg-white text-gray-900"
          }`}
          type="button"
          onClick={onToggleHover}
          title="Toggle hover effects"
        >
          Hover
        </button>
        <button
          aria-label="Send"
          className="h-9 w-9 border-none rounded-full bg-slate-900 text-white flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          type="button"
          onClick={onSubmit}
          disabled={!value.trim() || isSyncing}
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path d="M9 16V6.414L5.707 9.707a1 1 0 0 1-1.414-1.414l5-5a1 1 0 0 1 1.414 0l5 5a1 1 0 1 1-1.414 1.414L11 6.414V16a1 1 0 1 1-2 0Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default EditorBar;
