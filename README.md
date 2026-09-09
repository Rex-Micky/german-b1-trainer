# Deutsch B1 Trainer

A German A2 → B1 practice app I built while preparing for the B1 exam myself.
No build step, no framework, no bundler — plain HTML, CSS and JavaScript, deployed
as static files.

**Live:** https://rex-deutsch-b1-trainer.web.app

---

## What it does

| Area | What's in it |
|---|---|
| **Lernen** | A guided A2 → B1 path, 33 lessons grouped into modules |
| **Grammatik** | Practice questions across 11 topics (Perfekt, Präteritum, kausal/konzessiv, temporal, two-part connectors, …) at three difficulty levels |
| **Vokabeln** | Spaced repetition on a 0/1/2/4/7/15-day schedule, plus matching and memory games |
| **Prüfung** | Three full mock exams in the Goethe-Zertifikat B1 format, with speech synthesis for the listening sections |
| **Gespräch** | A conversation partner that talks back in German, so you can practise writing something other than gap-fills |

Progress is kept in `localStorage`. If you sign in, it also syncs to Firestore so the
same progress follows you between your phone and your desktop.

---

## Running it

It's static. Any web server works:

```bash
python -m http.server 5173
```

Then open `http://localhost:5173`.

Opening `index.html` directly from disk mostly works too, but the Firebase module is an
ES module, so the optional cloud sync stays off over `file://`. Everything else runs.

---

## The conversation partner

Two providers, and the app works fine with neither.

**Local (Ollama)** — nothing leaves your machine. Point the app at your Ollama server in
the settings panel. On a phone, `localhost` won't reach your PC, so use the LAN address
and start Ollama with `OLLAMA_HOST=0.0.0.0`; the app also needs to be allowed in
`OLLAMA_ORIGINS`.

Requests set `think: false`, because reasoning models such as Qwen3 and R1 otherwise
spend the whole token budget inside a hidden `<think>` block and return empty content.

**Claude API** — you paste your own key. It is stored in `localStorage` in your browser
and is never uploaded or synced. Note that calling the Anthropic API straight from a
browser means the key lives in the page, which is why the request carries
`anthropic-dangerous-direct-browser-access`. That's an acceptable trade for a personal
tool on your own machine; don't use it with a key you care about on a shared computer.

---

## Layout

```
index.html                 markup + script tags, nothing else
css/styles.css
js/
  core.js                  icons, config, storage, answer checking, speech, helpers
  nav.js                   section switching
  grammar.js               grammar drill engine
  vocab.js                 spaced repetition + the vocab games
  lernen.js                the lesson path
  pruefung.js              mock exam engine
  gespraech.js             chat UI + Ollama/Claude calls
  settings.js              theme and API key panel
  cloud.js                 auth UI and the sync bridge
  boot.js                  start-up
  firebase-sync.js         ES module; the only file that touches Firebase
  content/
    grammar-questions.js   the question bank
    vocabulary.js          the word lists
    lessons.js             lesson text
    exams.js               the three mock exams
```

The scripts are plain classic scripts loaded in order and sharing globals — not modules.
That's deliberate: it keeps the whole thing deployable by copying a folder, with no build
step to break. `core.js` declares the empty `DATA`, `VOCAB`, `LESSONS` and `EXAMS` arrays
that the `content/` files fill, so **load order in `index.html` matters**.

---

## Firebase

`firestore.rules` limits every signed-in user to their own document and denies everything
else:

```
match /users/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```

The Firebase config in `js/firebase-sync.js` is a web config. Those are meant to be
public — they identify the project, they don't authorise anything; access is controlled
by the rules above.

---

## Licence

MIT — see [LICENSE](LICENSE).
