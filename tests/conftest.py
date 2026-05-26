import pytest
from unittest.mock import patch, AsyncMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, get_db

LYES  = {"username": "lyes",  "email": "lyes@test.com",  "password": "pass1234"}
SERRA = {"username": "serra", "email": "serra@test.com", "password": "pass1234"}

QUESTION_PAYLOAD = {
    "text": "What is 2 + 2?",
    "option_a": "3",
    "option_b": "4",
    "option_c": "5",
    "option_d": "6",
    "correct_answer": "B",
    "category": "Math",
    "difficulty": "easy",
}


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)

    def override_get_db():
        db = Session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    # Patch broadcast so endpoints that call it don't error on missing WebSocket connections
    with patch("app.websocket_manager.manager.broadcast", new_callable=AsyncMock):
        with TestClient(app) as c:
            yield c

    app.dependency_overrides.clear()


def _register_and_login(client, user_data):
    client.post("/users/", json=user_data)
    res = client.post(
        "/auth/login",
        json={"username": user_data["username"], "password": user_data["password"]},
    )
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


@pytest.fixture
def auth(client):
    return _register_and_login(client, LYES)


@pytest.fixture
def auth2(client):
    return _register_and_login(client, SERRA)


@pytest.fixture
def question(client, auth):
    res = client.post("/questions/", headers=auth, json=QUESTION_PAYLOAD)
    return res.json()


@pytest.fixture
def active_game(client, auth, auth2):
    game = client.post("/games/", headers=auth).json()
    client.put(f"/games/{game['room_code']}/join", headers=auth2)
    return game["game_id"]


@pytest.fixture
def active_round(client, auth, active_game, question):
    res = client.post(f"/games/{active_game}/rounds/", headers=auth)
    return active_game, res.json()["round_id"]
