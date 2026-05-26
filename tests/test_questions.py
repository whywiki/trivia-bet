from tests.conftest import QUESTION_PAYLOAD


def test_create_question(client, auth):
    res = client.post("/questions/", headers=auth, json=QUESTION_PAYLOAD)
    assert res.status_code == 201
    assert res.json()["text"] == QUESTION_PAYLOAD["text"]
    assert res.json()["correct_answer"] == QUESTION_PAYLOAD["correct_answer"]


def test_list_questions(client, auth, question):
    res = client.get("/questions/", headers=auth)
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["question_id"] == question["question_id"]
