def test_register(client):
    res = client.post("/users/", json={"username": "lyes", "email": "lyes@test.com", "password": "pass1234"})
    assert res.status_code == 201
    assert res.json()["username"] == "lyes"


def test_get_me(client, auth):
    res = client.get("/users/me", headers=auth)
    assert res.status_code == 200
    assert res.json()["username"] == "lyes"


def test_get_user(client, auth):
    me = client.get("/users/me", headers=auth).json()
    res = client.get(f"/users/{me['user_id']}", headers=auth)
    assert res.status_code == 200
    assert res.json()["user_id"] == me["user_id"]


def test_update_me(client, auth):
    res = client.put("/users/me", headers=auth, json={"username": "lyes_updated"})
    assert res.status_code == 200
    assert res.json()["username"] == "lyes_updated"


def test_delete_me(client, auth):
    res = client.delete("/users/me", headers=auth)
    assert res.status_code == 204
