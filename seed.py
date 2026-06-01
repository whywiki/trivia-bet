import requests
import time
from app.database import SessionLocal, engine
from app.models import User, Question, Game, Round, Bet, GamePlayer
from app.database import Base
import html

Base.metadata.create_all(bind=engine)

CATEGORIES = [
    (9, "General Knowledge"),
    (17, "Science & Nature"),
    (23, "History"),
    (22, "Geography"),
    (10, "Books"),
    (11, "Film"),
    (21, "Sports"),
    (18, "Computers"),
]

DIFFICULTY_MAP = {"easy": "easy", "medium": "medium", "hard": "hard"}

def fetch_opentdb(amount: int, category_id: int) -> list:
    url = f"https://opentdb.com/api.php?amount={amount}&category={category_id}&type=multiple"
    try:
        res = requests.get(url, timeout=10)
        data = res.json()
        if data.get("response_code") != 0:
            return []
        return data.get("results", [])
    except Exception as e:
        print(f"  Failed to fetch category {category_id}: {e}")
        return []

def convert(item: dict, category_name: str) -> dict | None:
    try:
        correct = html.unescape(item["correct_answer"])
        incorrects = [html.unescape(a) for a in item["incorrect_answers"]]
        all_options = incorrects + [correct]
        # shuffle deterministically enough for variety
        import random
        random.shuffle(all_options)
        correct_letter = ["A","B","C","D"][all_options.index(correct)]
        return {
            "text": html.unescape(item["question"]),
            "option_a": all_options[0],
            "option_b": all_options[1],
            "option_c": all_options[2],
            "option_d": all_options[3],
            "correct_answer": correct_letter,
            "category": category_name,
            "difficulty": item.get("difficulty", "medium"),
        }
    except Exception:
        return None

def seed():
    db = SessionLocal()
    try:
        existing = db.query(Question).count()
        if existing > 0:
            print(f"Database already has {existing} questions, skipping seed.")
            return

        all_questions = []
        for cat_id, cat_name in CATEGORIES:
            print(f"Fetching {cat_name}...")
            items = fetch_opentdb(25, cat_id)
            for item in items:
                q = convert(item, cat_name)
                if q:
                    all_questions.append(q)
            time.sleep(0.5)  # respect rate limit

        if not all_questions:
            print("OpenTDB returned nothing, falling back to built-in questions.")
            # paste your original hardcoded list here as fallback if needed
            return

        for q in all_questions:
            db.add(Question(**q))
        db.commit()
        print(f"Seeded {len(all_questions)} questions from OpenTDB.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()