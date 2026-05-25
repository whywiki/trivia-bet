let socket = null;

function getWsBase() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}`;
}

export function connectSocket(gameId, token, onMessage) {
  if (socket) {
    socket.close();
  }

  const BASE_WS_URL = import.meta.env.VITE_WS_URL
    ? `${import.meta.env.VITE_WS_URL}${window.location.host}`
    : getWsBase();

  socket = new WebSocket(`${BASE_WS_URL}/ws/${gameId}?token=${token}`);

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("WebSocket event:", data);
    onMessage(data);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
  };

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}
