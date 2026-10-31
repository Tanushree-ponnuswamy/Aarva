# How well does AARVA work? Test report

**Tested on:** 31 October 2026
**Tested by:** Claude (AI assistant), running the tests on the project owner's computer
**Book used:** *11th General English*, Tamil Nadu state board. It has 216 pages, 21 lessons and about 71,000 words.
**AI model:** Qwen3 8B, running on the same computer. The computer has a 4 GB NVIDIA RTX 2050 graphics card and 16 GB of memory.

> **How to read this report.** Every section starts with a plain-English explanation, then the result, then what it
> means. The raw numbers are in [`docs/results/`](results/). The scripts that produced them are in
> [`backend/tests/evaluation/`](../backend/tests/evaluation/), so anyone can run the tests again.

---

## 1. The short version

| What we checked | Result | Verdict |
|---|---|---|
| Does the search find the page with the answer? (30 questions) | **27 of 30 (90%)** had the right page in the top 5 | 🟢 Good |
| Are the tutor's answers correct? | **27 of 30 (90%)** correct | 🟢 Good |
| Does the tutor admit when the book doesn't have the answer? (10 off-topic questions) | **9 of 10** said "I couldn't find that". The 10th showed book passages and invented nothing. | 🟢 Good |
| Does the tutor point to the right page? | **80%** of the pages it named really contain the fact | 🟡 Fair |
| How long does an answer take? | Usually **about 36 seconds**. 9 in 10 answers arrive within **70 seconds**. | 🟡 Slow but usable |
| Does the summary cover the whole book, not just the first pages? | **Yes.** All 21 lessons, up to page 216, and it skips the cover and contents pages. | 🟢 Good |
| Are the AI summaries faithful to the book? | I read 2 lessons by hand and found **no invented facts** | 🟢 Good (small sample) |
| Are the AI-written quiz answer keys correct? (12 questions checked by hand) | **10 of 12** correct; 1 wrong, 1 had two correct options | 🟡 Fair |
| Does the app still work when the AI model is switched off? | Yes. Summaries and quizzes still come from the book's own text. | 🟢 Good |
| Is the text of the PDF fully read? | **About 100%** of the words were captured, with no empty pages | 🟢 Excellent |
| Can it read scanned pages (photos of text)? | **No**, not at the moment | 🔴 Gap |
| Can 20 people use it at once? | **Yes** for normal pages: 0 errors, answers in under 0.5 s | 🟢 Good |
| Security checks (5 attack tests) | **All 5 passed** | 🟢 Excellent |

**Bugs found and fixed during this testing:**
1. **About 1 in 6 passages could not be found by meaning.** The "meaning fingerprint" model only accepts about 512 words of input, and longer passages were silently stored blank. Fixed: long passages are now cut to fit, and blank ones are repaired automatically when the server starts.
2. **The AI never managed to write a quiz on this computer.** Writing 5 questions takes about 5 minutes here, but the app gave up after 2.5 minutes. Every quiz quietly came from the simple backup generator. Fixed: the AI now writes 3 questions at a time, with a 7-minute limit. After the fix, 4 out of 4 attempts worked.
3. **The embedding server was treated as "down" whenever it was slow.** Fixed: slow answers are retried, and only a refused connection counts as "down".

---

## 2. Finding the right page (search)

**What this means.** Before the tutor answers, it searches the book for the most relevant passages. If the search
misses the right page, the answer will be wrong or missing. AARVA uses two kinds of search together:

* **Keyword search** (also called BM25) finds passages that share the same words as the question.
* **Meaning search** (also called "dense" or "embedding" search) finds passages with the same meaning, even when the words differ.
* **Hybrid** search combines both. This is what AARVA really uses.

**How we tested.** We wrote 30 questions about the book and noted the page that holds each answer. We checked that every answer really is on that page. 20 questions reuse the book's own words ("keyword" questions). 10 say the same thing in different words ("paraphrase" questions). For each question, we checked whether the right page was in the top 5 results.

| Search method | All 30 questions | Keyword questions (20) | Paraphrase questions (10) | Ranking score (MRR, 1.0 = always first) |
|---|---|---|---|---|
| **Hybrid (what AARVA uses)** | **90%** | 95% | 80% | **0.75** |
| Meaning search only | 90% | 95% | 80% | 0.75 |
| Keyword search only | 87% | **100%** | 60% | 0.68 |

**What it means**
* Search works well. 9 times out of 10 the right page is in the top 5, and it is usually the first or second result.
* **Keyword search** is best when you use the book's exact words. It is weak when you rephrase (60%).
* **Meaning search** handles rephrased questions much better (80%).
* **Hybrid** search was never the worst of the three. It is the safest all-rounder. In this test, though, it did *not* clearly beat meaning search alone. The two tied. Tuning how much weight each method gets could improve this, and it is suggested as a next step.
* **Before the bug fix in section 1**, meaning search effectively did nothing, because 36 of 223 passages had blank fingerprints. Hybrid then scored the same as keyword search alone (87%). The test is what found this.

**The 3 questions the search missed:**
* "What happens to the narrator's coat when he gets into a car?"
* "What did the group discussion in the boxing lesson ask students to talk about?" The boxing lesson has more than one discussion activity, so this question was ambiguous.
* "What does the narrator of *The Accidental Tourist* ache to be?"

---

## 3. Are the tutor's answers right?

**How we tested.** We asked the tutor the same 30 questions, 10 questions the book does not cover, and 3 two-step conversations.

| Check | Result |
|---|---|
| Correct answers | **90%** (27 of 30). Keyword questions 95%, paraphrase questions 80%. |
| Wrongly said "not in the document" when it was | **3%** (1 of 30) |
| Answers that name a page | **93%** |
| Answers that name the *right* page | **80%** |
| Named pages that really contain the fact | **80%** (24 of 30) |
| Answer sentences whose words come from the retrieved pages (rough automatic check) | **83%** |
| Off-topic questions where it admitted it doesn't know | **90%** (9 of 10). Nothing was invented. |
| Follow-up questions ("explain that simply") that kept the context | **2 of 3** |

**The 3 wrong answers, and why**
1. *"What does the narrator of The Accidental Tourist ache to be?"* The book says "suave". The tutor said "graceful and composed", which is the right idea in different words, because the search missed the exact page.
2. *"What happens to the narrator's coat…"* The search missed the page, so the tutor honestly said it couldn't find it.
3. *"What did the group discussion in the boxing lesson ask…"* The tutor described a different discussion activity from the same lesson. The question was ambiguous.

**Times the model was too slow.** In 3 of 46 calls the AI did not answer within 90 seconds. The app then showed the most relevant passages from the book instead of inventing something. One off-topic question and one follow-up "failed" only for this reason.

---

## 4. Lesson summaries

**What this means.** When a book is uploaded, AARVA writes a summary for every lesson. The aim is to read *every* page, not just the first few.

| Check | Result |
|---|---|
| Lessons found from the book's own table of contents | **21 lessons**, starting at page 7 (cover, copyright and contents skipped) ✔ |
| Long-book test: do later lessons get summaries? | **Pass.** Every lesson up to page 216 has a summary. |
| Model switched off (backup summary) | **Pass.** All 216 pages summarised in **3 seconds**, using sentences taken from the book. |
| Model switched on (2 lessons, pages 7–32) | 7 sections read in **10 minutes**, about **86 seconds per section** |
| Time for the whole book with the model, on this computer | About **1.5 hours**. The book is usable for chat straight away while this runs in the background. |
| Faithfulness, checked by hand | Both AI summaries I read match the book, with no invented facts. For example, the *Once Upon a Time* summary correctly names Gabriel Okara and quotes "laugh with their teeth" and "ice-block-cold eyes". |
| Key terms per lesson | Accurate, for example "rosary", "sparrows", "scriptures" and "cocktail face" |

**Things to improve**
* The automatic faithfulness check scored the AI summaries only 32%. This is because the AI rewords the text, and the check counts reworded sentences as unsupported. **Trust the hand check, not this number.** A better automatic check is needed.
* In the model run, the "Key Concepts" tab came out empty. The step that writes concepts produced nothing and needs a fix.
* The backup summary (no model) also has no concepts or definitions. It only has lesson summaries and key points.
* The book's last page, "Acknowledgement", was treated as a lesson. It should be skipped like the front matter.

---

## 5. Quizzes

**How we tested.** We made quizzes for 4 lessons spread across the book (pages 7–25, 64–71, 132–137 and 174–188), once with the AI model and once with it switched off. I checked every AI-written question against the book by hand.

| Check | With the AI model | With the model off (backup) |
|---|---|---|
| Questions produced | 12 (3 per lesson) | 20 (5 per lesson) |
| Time | About **9 minutes** (about 45 s per question) | **16 seconds** |
| Correctly formatted (4 different options, 1 marked answer) | 100% | 100% |
| Marked answer is truly correct (hand check) | **10 of 12 (83%)** | 20 of 20 (the answer is the book's own word) |
| Good study questions (hand check) | 9 of 12 | **12 of 20 (60%)**. The rest came from exercise instructions or had unclear options. |
| Questions that come from the right lesson | 12 of 12 | 20 of 20 |
| Pages used per lesson | not measured | 4–5 different pages per lesson |
| Mix of easy, medium and hard | 4 / 4 / 4 | mostly "medium" |

**The two problem questions from the AI**
* *"Why does Philip Sletherby suspect Bertie?"* The marked answer misstates the story's crest detail.
* *"What did Bryson's bag contain?"* Two of the options are both true.

**Before the fix**, the AI could not finish a single quiz on this computer, so 0 of 4 attempts worked. Every question silently came from the backup. After the fix, 4 of 4 attempts worked.

**Not tested:** whether "easy" and "hard" questions really are easier or harder for students. That needs real students' scores.

---

## 6. Reading documents

| Check | Result |
|---|---|
| Words captured from the 216-page book | **71,298**, against 71,285 (PyMuPDF) and 71,610 (pdfplumber). That is **about 100% of the text**. |
| Empty pages | **0** |
| PDF | ✔ |
| Word (.docx) | ✔ |
| Excel (.xlsx) | ✔ |
| Text (.txt) | ✔ |
| Picture of text (.png) | ✘ No text came out. The OCR library is installed, but it produced nothing on this computer. Its model files are probably missing. |
| Tables in Word, PDF and Excel | ✔ Rows stay readable. For example: "Planet \| Moons — Earth \| 1 — Mars \| 2". |
| Scanned PDF (12 pages of pictures of text) | ✘ **0 words.** The app only tries OCR for scanned PDFs of 10 pages or fewer. |

**What it means.** Normal digital textbooks are read completely. Scanned books and photos of pages are **not** read at the moment. This is the biggest gap in document support.

---

## 7. Speed and load

| Check | Result |
|---|---|
| Time to prepare a book for chat | 10 pages: **26 s**. 50 pages: **2 min**. 216 pages: about **9 min** (about 2.5 s per page). Most of this is building the meaning fingerprints. |
| Time for one tutor answer | Typical (median) **36 s**. 9 in 10 within **69 s**. One extreme 24-minute case happened while the computer was paused, and is left out of these numbers. |
| Keyword search cost as books grow | 100 passages: **24 ms**. 1,000: **194 ms**. 5,000: **1 s** per question. It grows steadily, because the keyword index is rebuilt for every question. That is fine for normal textbooks (about 220 passages) but would be slow for a 5,000-passage library. |
| 5, 10 and 20 users at once (library, profile and summary pages) | **0 errors**. 95% of answers within **46 ms, 487 ms and 174 ms** |
| Graphics card while answering | 100% busy, **3.1 GB** of the 4 GB used. The model runs about 64% on the main processor and 36% on the graphics card, because it does not fit fully on the card. |

**What it means.** Normal pages are fast even with many users. **The AI part is the bottleneck.** On this computer the model writes about 4–5 words per second and answers one person at a time. Several people asking the tutor at once were **not** tested, but they would have to wait in a queue. A computer with a bigger graphics card (8 GB or more) would make answers several times faster.

---

## 8. Security

| Test | Expected | Result |
|---|---|---|
| 9 wrong passwords in a row | The 9th is blocked | ✔ Blocked on the 9th try (HTTP 429) |
| 5 wrong verification codes | The code stops working | ✔ Even the right code is rejected afterwards |
| Using a token after logging out | Rejected | ✔ Rejected (HTTP 401) |
| User B opening user A's book (file, summary, status, delete, chat) | Not allowed | ✔ All refused (HTTP 404), and the book is not in B's library |
| Using the app with no login | Rejected | ✔ Rejected (HTTP 401) |
| Existing automatic security tests | Pass | ✔ 2 of 2 pass |

---

## 9. What was **not** tested, and why

| Not tested | Why |
|---|---|
| Other languages (Tamil and others) | The app is currently set to **English only**. |
| OCR accuracy (word error rate) | OCR produced no text on this computer, so there was nothing to measure. |
| Quiz difficulty against real students | Needs real student scores. |
| 100 quizzes for the format-success rate | Each AI quiz takes minutes on this computer. 4 batches were tested instead. |
| Several people chatting with the AI at the same time | The local model handles one question at a time. Only normal pages were load-tested. |
| The live website on Render | The tests ran on the local computer with the same code. The live site still needs its database setting fixed (see the earlier notes). |

**Sample size.** These are small tests: 30 questions, 2 lessons of summaries and 12 AI quiz questions. They show clear strengths and weaknesses, but the exact percentages could move by around ±10 points with more questions.

---

## 10. Run the tests again

From the `backend` folder, with Ollama running `qwen3:8b` and `bge-large`:

```bash
python tests/evaluation/run_retrieval.py "<path to book.pdf>" work ../docs/results/retrieval.json
python tests/evaluation/run_answers.py   "<path to book.pdf>" work ../docs/results/answers.json
python tests/evaluation/run_summary.py   "<path to book.pdf>" offline ../docs/results/summary_offline.json
python tests/evaluation/run_summary.py   "<path to book.pdf>" llm ../docs/results/summary_llm.json 2
python tests/evaluation/run_quiz.py      "<path to book.pdf>" work llm ../docs/results/quiz_llm.json 3 4
python tests/evaluation/run_quiz.py      "<path to book.pdf>" work offline ../docs/results/quiz_offline.json 5 4
python tests/evaluation/run_parsing.py   "<path to book.pdf>" work ../docs/results/parsing.json
python tests/evaluation/run_system.py    work ../docs/results/system.json
python tests/evaluation/run_security.py  ../docs/results/security.json
```

The questions and their answer pages are in `backend/tests/evaluation/questions.py`. To test a different book, write new questions there.

---

## Word list

* **Passage / chunk**: a small piece of the book (about one page) that the search looks through.
* **Keyword search (BM25)**: finds passages that share words with the question.
* **Meaning search (dense / embeddings)**: turns text into a list of numbers (a "fingerprint"), so passages with the same *meaning* can be found even when the words differ.
* **Hybrid search**: both kinds of search combined.
* **Top 5 (recall@5)**: the right page is among the first 5 results.
* **MRR (ranking score)**: 1.0 means the right page is always first, and 0.5 means it is usually second.
* **Fallback / backup**: what the app does when the AI model is off or too slow. It uses the book's own sentences instead.
* **OCR**: reading text from a picture of a page.
* **p50 / median**: the typical value. Half are faster and half are slower.
* **p95 / p90**: 95 (or 90) out of 100 are this fast or faster.
* **HTTP 401, 404 and 429**: the server's replies for "not logged in", "not found / not yours" and "too many attempts".
