import "../App.css";

function Insights({ comments = [], suggestions = [], onSuggestionClick }) {
  const hasComments = comments && comments.length > 0;
  const hasSuggestions = suggestions && suggestions.length > 0;

  if (!hasComments && !hasSuggestions) return null;

  const formatMarkdownBold = (text) =>
    text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  return (
    <div className="insights">
      {hasComments && (
        <div className="insight-block">
          <h2 className="insight-title">Observations</h2>
          <ul className="insight-list">
            {comments.map((comment, idx) => (
              <li
                key={`comment-${idx}`}
                className="insight-item"
                dangerouslySetInnerHTML={{
                  __html: formatMarkdownBold(comment),
                }}
              />
            ))}
          </ul>
        </div>
      )}

      {hasSuggestions && (
        <div className="insight-block">
          <h2 className="insight-title">Follow-up Questions</h2>
          <ul className="insight-list">
            {suggestions.map((suggestion, idx) => (
              <li key={`suggestion-${idx}`} className="insight-item">
                <a
                  href="#"
                  className="suggestion-link"
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
