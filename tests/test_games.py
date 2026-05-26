def test_create_game(client, auth):
    res = client.post("/games/", headers=auth)
    assert res.status_code == 201
    assert res.json()["status"] == "waiting"
    assert len(res.json()["room_code"]) == 6


def test_list_games(client, auth, active_game):
    res = client.get("/games/", headers=auth)
    assert res.status_code == 200
    assert any(g["game_id"] == active_game for g in res.json())


def test_get_game(client, auth, active_game):
    res = client.get(f"/games/{active_game}", headers=auth)
    assert res.status_code == 200
    assert res.json()["game_id"] == active_game


def test_join_game(client, auth, auth2):
    game = client.post("/games/", headers=auth).json()
    res = client.put(f"/games/{game['room_code']}/join", headers=auth2)
    assert res.status_code == 200
    assert res.json()["status"] == "active"


def test_delete_game(client, auth):
    game = client.post("/games/", headers=auth).json()
    res = client.delete(f"/games/{game['game_id']}", headers=auth)
    assert res.status_code == 204
