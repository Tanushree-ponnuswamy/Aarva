"""Question set for evaluating AARVA on one real textbook:
"11th General English" (Tamil Nadu state board, 216 pages).

Every question has the PDF page(s) that contain the answer and the words an correct answer must contain.
Pages are PDF page numbers (the number shown in the app's viewer), not the printed page numbers.
"keyword" questions reuse the book's own words; "paraphrase" questions avoid them.
"""

# (question, answer pages, any-of keywords the correct answer should contain, kind)
IN_DOCUMENT = [
    # ── keyword questions: exact terms from the book ──
    ("Which prefix is added to the word 'audible' to form 'inaudible'?", [13], ["in-", "prefix in", "'in'", "in"], "keyword"),
    ("According to Edward Fry, how many reading speeds are there?", [15], ["three", "3"], "keyword"),
    ("What is skimming?", [15], ["fastest", "skimming"], "keyword"),
    ("What do laughter yoga warm-up techniques include?", [16], ["stretching", "chanting", "clapping"], "keyword"),
    ("What does transcription mean?", [180], ["verbatim", "audio", "writing"], "keyword"),
    ("What should a good resume begin with?", [184], ["identification", "name", "address"], "keyword"),
    ("In which order should work history be listed in a resume?", [184], ["reverse chronological", "reverse"], "keyword"),
    ("How much did the dealer bid in the auction in Tight Corners?", [112], ["four thousand", "4000", "4,000"], "keyword"),
    ("What did the narrator bid in the auction after the dealer's bid?", [112], ["fifty"], "keyword"),
    ("What fell from the grandmother's fingers when she died?", [10], ["rosary"], "keyword"),
    ("Which scientific law did the narrator tell his grandmother about?", [9], ["gravity"], "keyword"),
    ("What do the speaking activity words say athletes cannot run with?", [47], ["money", "pockets"], "keyword"),
    ("What did the boxer have to eat with in China?", [42], ["chopsticks"], "keyword"),
    ("What does the word jet lag mean?", [44], ["tired", "flight", "time zones"], "keyword"),
    ("Which idiom means help at the last moment rescuing one from a difficult situation?", [118], ["saved by the bell"], "keyword"),
    ("What is the poet's faith in Lines Written in Early Spring?", [93], ["flower", "air"], "keyword"),
    ("Who did King Richard the Second surrender to?", [192], ["bolingbroke"], "keyword"),
    ("How is Sindhu said, I play chess written in reported speech?", [155], ["played chess", "she played"], "keyword"),
    ("What does the narrator of The Accidental Tourist ache to be?", [176], ["suave"], "keyword"),
    ("What does the Queen of Boxing glossary say about the word lauded?", [44], ["appreciated"], "keyword"),
    # ── paraphrase questions: the book's words are avoided ──
    ("Why was the narrator's grandmother unhappy about what he learned at the English school?", [9], ["god", "scriptures", "religio"], "paraphrase"),
    ("How did the old woman spend her last moments before she passed away?", [10], ["pray", "rosary", "beads"], "paraphrase"),
    ("Which things does the essayist admit he easily leaves behind?", [74], ["books", "walking"], "paraphrase"),
    ("What is the difference between writing down speech in the same language and converting text into another language?", [180], ["translation", "transcription"], "paraphrase"),
    ("How were universities used by rulers in the old days according to the speech?", [146], ["royalty", "poets", "scholars", "monarch"], "paraphrase"),
    ("Which expression describes abandoning someone who is in trouble?", [118], ["hang out to dry"], "paraphrase"),
    ("Which reading style is the quickest?", [15], ["skimming"], "paraphrase"),
    ("Which subject area does the word universities belong to in the speech exercise?", [150], ["education"], "paraphrase"),
    ("What happens to the narrator's coat when he gets into a car?", [176], ["coat", "outside", "door"], "paraphrase"),
    ("What did the group discussion in the boxing lesson ask students to talk about?", [47], ["mary kom", "athletes", "hope", "dreams"], "paraphrase"),
]

# Questions the book does NOT answer: a good tutor must say so instead of inventing an answer.
OUT_OF_DOCUMENT = [
    "Who won the FIFA World Cup in 2018?",
    "What is the capital city of Australia?",
    "Explain Newton's second law of motion.",
    "How do I write a for loop in Python?",
    "Give me a recipe for chocolate cake.",
    "What is the structure of DNA?",
    "What was India's GDP last year?",
    "Who won the cricket world cup in 1983?",
    "What does the mitochondria do in a cell?",
    "How does the stock market work?",
]

# Follow-up questions that only make sense with the previous turn: (first question, follow-up, any-of words expected)
MULTI_TURN = [
    ("What is skimming?", "Explain that in very simple words.", ["skim", "fast", "quick"]),
    ("What does transcription mean?", "Can you give me an example of it?", ["audio", "listen", "write", "speech", "transcri"]),
    ("What should a good resume begin with?", "And what comes after that?", ["education", "qualification", "work", "experience"]),
]
