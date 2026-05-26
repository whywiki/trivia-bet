def test_place_bet(client, auth, active_round):
    game_id, round_id = active_round
    res = client.post(
        f"/games/{game_id}/rounds/{round_id}/bets/",
        headers=auth,
        json={"chosen_answer": "B", "bet_amount": 100},
    )
    assert res.status_code == 201
    assert res.json()["chosen_answer"] == "B"
    assert res.json()["bet_amount"] == 100


def test_get_bets(client, auth, active_round):
    game_id, round_id = active_round
    client.post(
        f"/games/{game_id}/rounds/{round_id}/bets/",
        headers=auth,
        json={"chosen_answer": "B", "bet_amount": 100},
    )
    res = client.get(f"/games/{game_id}/rounds/{round_id}/bets/", headers=auth)
    assert res.status_code == 200
    assert len(res.json()) == 1


def test_get_my_bet(client, auth, active_round):
    game_id, round_id = active_round
    client.post(
        f"/games/{game_id}/rounds/{round_id}/bets/",
        headers=auth,
        json={"chosen_answer": "B", "bet_amount": 100},
    )
    res = client.get(f"/games/{game_id}/rounds/{round_id}/bets/me", headers=auth)
    assert res.status_code == 200
    assert res.json()["chosen_answer"] == "B"
