const BASE_WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

let socket = null;

export function connectSocket(gameId, token, onMessage) {
  if (socket) {
    socket.close();
  }

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
