let socket = null;

function getWsBase() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}`;
}

export function connectSocket(gameId, token, onMessage) {
  if (socket) {
    socket.close();
  }

  const wsBase = import.meta.env.VITE_WS_URL
    ? import.meta.env.VITE_WS_URL.startsWith("ws")
      ? import.meta.env.VITE_WS_URL          // full URL: ws://localhost:8000
      : `${getWsBase()}${import.meta.env.VITE_WS_URL}` // path only: /ws
    : getWsBase();                            // fallback: derive from window

  socket = new WebSocket(`${wsBase}/${gameId}?token=${token}`);
  
  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
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
