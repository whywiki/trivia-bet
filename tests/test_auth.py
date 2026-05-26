def test_login(client):
    client.post("/users/", json={"username": "lyes", "email": "lyes@test.com", "password": "pass1234"})
    res = client.post("/auth/login", json={"username": "lyes", "password": "pass1234"})
    assert res.status_code == 200
    assert "access_token" in res.json()
    assert res.json()["token_type"] == "bearer"
