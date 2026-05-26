def test_create_round(client, auth, active_game, question):
    res = client.post(f"/games/{active_game}/rounds/", headers=auth)
    assert res.status_code == 201
    assert res.json()["status"] == "active"
    assert res.json()["round_number"] == 1


def test_list_rounds(client, auth, active_round):
    game_id, _ = active_round
    res = client.get(f"/games/{game_id}/rounds/", headers=auth)
    assert res.status_code == 200
    assert len(res.json()) == 1
