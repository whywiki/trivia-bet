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

export async function getUser(userId) {
  const res = await fetch(`${BASE_URL}/users/${userId}`, {
    headers: authHeaders(),
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

export async function updateMe(data) {
  const res = await fetch(`${BASE_URL}/users/me`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function deleteMe() {
  const res = await fetch(`${BASE_URL}/users/me`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
}

export async function listGames() {
  const res = await fetch(`${BASE_URL}/games/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function deleteGame(gameId) {
  const res = await fetch(`${BASE_URL}/games/${gameId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
}

export async function listQuestions(category, difficulty) {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (difficulty) params.append("difficulty", difficulty);
  const res = await fetch(`${BASE_URL}/questions/?${params}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function createQuestion(data) {
  const res = await fetch(`${BASE_URL}/questions/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function listRounds(gameId) {
  const res = await fetch(`${BASE_URL}/games/${gameId}/rounds/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function getBets(gameId, roundId) {
  const res = await fetch(`${BASE_URL}/games/${gameId}/rounds/${roundId}/bets/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function getMyBet(gameId, roundId) {
  const res = await fetch(`${BASE_URL}/games/${gameId}/rounds/${roundId}/bets/me`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function quitGame(gameId) {
    const res = await fetch(`${BASE_URL}/games/${gameId}/quit`, {
        method: "PUT",
        headers: authHeaders(),
    });
    if (!res.ok) throw await res.json();
    return res.json();
}
