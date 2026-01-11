const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8006";

// Safely parse JSON response, returns null if parsing fails
async function parseResponse(response) {
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
}

// Send application state to backend and receive updated state
// Returns: { data, error } - data contains updated state, error contains error message if any
export async function postState(state) {
  try {
    const response = await fetch(`${BASE_URL}/state`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(state),
    });

    if (response.ok) {
      const data = await parseResponse(response);
      return { data, error: "" };
    }

    const errorData = await parseResponse(response);
    const detail = errorData?.detail || response.statusText;
    return { data: null, error: detail };
  } catch (error) {
    return { data: null, error: error.message || "Failed to sync state" };
  }
}

// Send hover event to backend to generate contextual question
// Returns: { data, error } - data contains { message: "generated question" }
export async function postHoverEvent(hoverState) {
  try {
    const response = await fetch(`${BASE_URL}/hover_event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hoverState),
    });

    if (response.ok) {
      const data = await parseResponse(response);
      return { data, error: "" };
    }

    const errorData = await parseResponse(response);
    const detail = errorData?.detail || response.statusText;
    return { data: null, error: detail };
  } catch (error) {
    return { data: null, error: error.message || "Failed to send hover event" };
  }
}
