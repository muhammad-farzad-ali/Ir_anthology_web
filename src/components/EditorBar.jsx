import { useEffect, useRef } from "react";
import "../App.css";

function EditorBar({
  value,
  onChange,
  onSubmit,
  isSyncing,
  hoverEnabled,
  onToggleHover,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleInput = (e) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="search-box">
      <button className="icon-button" aria-label="Add">
        <svg
          className="icon"
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

      <div className="search-input">
        <textarea
          ref={textareaRef}
          className="composer"
          placeholder="Ask anything"
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
        />
      </div>

      <div className="search-actions">
        <button
          className={`toggle-hover ${hoverEnabled ? "active" : ""}`}
          type="button"
          onClick={onToggleHover}
          title="Toggle hover effects"
        >
          Hover
        </button>
        <button
          aria-label="Send"
          className="send-button"
          type="button"
          onClick={onSubmit}
          disabled={!value.trim() || isSyncing}
        >
          <svg
            className="icon"
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
