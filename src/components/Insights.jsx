function Insights({ comments = [], suggestions = [], onSuggestionClick }) {
  const hasComments = comments && comments.length > 0;
  const hasSuggestions = suggestions && suggestions.length > 0;

  // Don't render if no insights available
  if (!hasComments && !hasSuggestions) return null;

  // Convert markdown bold syntax (**text**) to HTML <strong> tags
  // Used for rendering backend-generated formatted text
  const formatMarkdownBold = (text) =>
    text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  return (
    <div className="flex flex-col gap-5">
      {hasComments && (
        <div className="flex flex-col gap-3">
          <h2 className="m-0 text-sm font-bold text-slate-900">Observations</h2>
          <ul className="list-none p-0 m-0 border-t border-gray-200">
            {comments.map((comment, idx) => (
              <li
                key={`comment-${idx}`}
                className="py-3 px-3 border-b border-gray-200 text-sm text-gray-900"
                dangerouslySetInnerHTML={{
                  __html: formatMarkdownBold(comment),
                }}
              />
            ))}
          </ul>
        </div>
      )}

      {hasSuggestions && (
        <div className="flex flex-col gap-3">
          <h2 className="m-0 text-sm font-bold text-slate-900">
            Follow-up Questions
          </h2>
          <ul className="list-none p-0 m-0 border-t border-gray-200">
            {suggestions.map((suggestion, idx) => (
              <li
                key={`suggestion-${idx}`}
                className="py-3 px-3 border-b border-gray-200 text-sm text-gray-900"
              >
                <a
                  href="#"
                  className="flex gap-2 text-slate-900 no-underline hover:text-gray-800 hover:bg-gray-50"
                  onClick={(e) => {
                    e.preventDefault();
                    onSuggestionClick?.(suggestion);
                  }}
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdownBold(suggestion),
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Insights;
