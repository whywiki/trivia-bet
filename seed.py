from app.database import SessionLocal, engine
from app.models import User, Question, Game, Round, Bet, GamePlayer
from app.database import Base

Base.metadata.create_all(bind=engine)

questions = [
    {
        "text": "What is the capital of France?",
        "option_a": "London",
        "option_b": "Berlin",
        "option_c": "Paris",
        "option_d": "Madrid",
        "correct_answer": "C",
        "category": "Geography",
        "difficulty": "easy"
    },
    {
        "text": "What is the largest planet in our solar system?",
        "option_a": "Saturn",
        "option_b": "Jupiter",
        "option_c": "Neptune",
        "option_d": "Uranus",
        "correct_answer": "B",
        "category": "Science",
        "difficulty": "easy"
    },
    {
        "text": "Who painted the Mona Lisa?",
        "option_a": "Michelangelo",
        "option_b": "Raphael",
        "option_c": "Donatello",
        "option_d": "Leonardo da Vinci",
        "correct_answer": "D",
        "category": "Art",
        "difficulty": "easy"
    },
    {
        "text": "What is the chemical symbol for gold?",
        "option_a": "Go",
        "option_b": "Gd",
        "option_c": "Au",
        "option_d": "Ag",
        "correct_answer": "C",
        "category": "Science",
        "difficulty": "easy"
    },
    {
        "text": "In what year did World War II end?",
        "option_a": "1943",
        "option_b": "1944",
        "option_c": "1946",
        "option_d": "1945",
        "correct_answer": "D",
        "category": "History",
        "difficulty": "easy"
    },
    {
        "text": "What is the smallest country in the world?",
        "option_a": "Monaco",
        "option_b": "San Marino",
        "option_c": "Vatican City",
        "option_d": "Liechtenstein",
        "correct_answer": "C",
        "category": "Geography",
        "difficulty": "medium"
    },
    {
        "text": "What is the speed of light in km/s?",
        "option_a": "300,000",
        "option_b": "150,000",
        "option_c": "450,000",
        "option_d": "100,000",
        "correct_answer": "A",
        "category": "Science",
        "difficulty": "medium"
    },
    {
        "text": "Who wrote 'The Divine Comedy'?",
        "option_a": "Petrarch",
        "option_b": "Boccaccio",
        "option_c": "Virgil",
        "option_d": "Dante Alighieri",
        "correct_answer": "D",
        "category": "Literature",
        "difficulty": "medium"
    },
    {
        "text": "What is the hardest natural substance on Earth?",
        "option_a": "Quartz",
        "option_b": "Diamond",
        "option_c": "Topaz",
        "option_d": "Corundum",
        "correct_answer": "B",
        "category": "Science",
        "difficulty": "easy"
    },
    {
        "text": "Which element has the atomic number 1?",
        "option_a": "Helium",
        "option_b": "Oxygen",
        "option_c": "Carbon",
        "option_d": "Hydrogen",
        "correct_answer": "D",
        "category": "Science",
        "difficulty": "easy"
    },
    {
        "text": "What is the longest river in the world?",
        "option_a": "Amazon",
        "option_b": "Yangtze",
        "option_c": "Nile",
        "option_d": "Mississippi",
        "correct_answer": "C",
        "category": "Geography",
        "difficulty": "easy"
    },
    {
        "text": "Who developed the theory of general relativity?",
        "option_a": "Isaac Newton",
        "option_b": "Nikola Tesla",
        "option_c": "Albert Einstein",
        "option_d": "Max Planck",
        "correct_answer": "C",
        "category": "Science",
        "difficulty": "easy"
    },
    {
        "text": "What is the currency of Japan?",
        "option_a": "Yuan",
        "option_b": "Won",
        "option_c": "Ringgit",
        "option_d": "Yen",
        "correct_answer": "D",
        "category": "Geography",
        "difficulty": "easy"
    },
    {
        "text": "Which planet is known as the Red Planet?",
        "option_a": "Venus",
        "option_b": "Mars",
        "option_c": "Mercury",
        "option_d": "Jupiter",
        "correct_answer": "B",
        "category": "Science",
        "difficulty": "easy"
    },
    {
        "text": "What is the powerhouse of the cell?",
        "option_a": "Nucleus",
        "option_b": "Ribosome",
        "option_c": "Mitochondria",
        "option_d": "Golgi apparatus",
        "correct_answer": "C",
        "category": "Science",
        "difficulty": "easy"
    },
    {
        "text": "In which year did the Titanic sink?",
        "option_a": "1910",
        "option_b": "1914",
        "option_c": "1908",
        "option_d": "1912",
        "correct_answer": "D",
        "category": "History",
        "difficulty": "easy"
    },
    {
        "text": "What is the largest ocean on Earth?",
        "option_a": "Atlantic",
        "option_b": "Indian",
        "option_c": "Arctic",
        "option_d": "Pacific",
        "correct_answer": "D",
        "category": "Geography",
        "difficulty": "easy"
    },
    {
        "text": "Who was the first person to walk on the moon?",
        "option_a": "Buzz Aldrin",
        "option_b": "Yuri Gagarin",
        "option_c": "Neil Armstrong",
        "option_d": "John Glenn",
        "correct_answer": "C",
        "category": "History",
        "difficulty": "easy"
    },
    {
        "text": "What is the most spoken language in the world by native speakers?",
        "option_a": "English",
        "option_b": "Spanish",
        "option_c": "Hindi",
        "option_d": "Mandarin Chinese",
        "correct_answer": "D",
        "category": "Culture",
        "difficulty": "medium"
    },
    {
        "text": "Which country invented gunpowder?",
        "option_a": "India",
        "option_b": "China",
        "option_c": "Persia",
        "option_d": "Egypt",
        "correct_answer": "B",
        "category": "History",
        "difficulty": "medium"
    },
]

def seed():
    db = SessionLocal()
    try:
        existing = db.query(Question).count()
        if existing > 0:
            print(f"Database already has {existing} questions, skipping seed.")
            return

        for q in questions:
            db.add(Question(**q))
        db.commit()
        print(f"Seeded {len(questions)} questions successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
