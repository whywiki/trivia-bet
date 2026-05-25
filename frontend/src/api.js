const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  return sessionStorage.getItem("token");
}

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token || getToken()}`,
  };
}

export async function register(username, email, password) {
  const res = await fetch(`${BASE_URL}/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function getMe(token) {
  const res = await fetch(`${BASE_URL}/users/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function createGame() {
  const res = await fetch(`${BASE_URL}/games/`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function joinGame(roomCode) {
  const res = await fetch(`${BASE_URL}/games/${roomCode}/join`, {
    method: "PUT",
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function getGame(gameId) {
  const res = await fetch(`${BASE_URL}/games/${gameId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function createRound(gameId) {
  const res = await fetch(`${BASE_URL}/games/${gameId}/rounds/`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function placeBet(gameId, roundId, chosenAnswer, betAmount) {
  const res = await fetch(
    `${BASE_URL}/games/${gameId}/rounds/${roundId}/bets/`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        chosen_answer: chosenAnswer,
        bet_amount: betAmount,
      }),
    }
  );
  if (!res.ok) throw await res.json();
  return res.json();
}
