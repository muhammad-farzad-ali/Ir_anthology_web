const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8006";

async function parseResponse(response) {
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
}

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
