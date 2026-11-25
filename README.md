# Lexicon

Lexicon is an English essay editor. Select a word to see it in its sentence, compare alternatives, and replace that occurrence. The frontend currently reads hand-picked results from a [JSON fixture](public/data/thesaurus.json).

## Proposed backend API

The research task compares how well PPMI + SVD and Word2Vec reproduce human ratings of **word-pair similarity**. Both models learn from neighboring words in the training corpus and produce one vector per vocabulary word. Each occurrence of “write” therefore gets the same baseline similarity scores.

The editor has an additional use for context. After retrieving candidates, the backend can filter them for meaning, part of speech, and grammatical form in the writer’s sentence. For example, “draft” fits “We write a sentence” more naturally than “Please write your name here.” The local JSON demo uses fixed word-pair scores. The writer makes the final choice.

### Request

```http
POST /api/v1/alternatives HTTP/1.1
Content-Type: application/json
Accept: application/json
```

```json
{
  "term": "write",
  "sentence": "We write a sentence, read it back, and notice the distance between the idea on the page and the one we had in mind.",
  "start": 3,
  "end": 8
}
```

Send the original sentence displayed in the card. Hovering over an alternative changes only the local preview. The essay title and surrounding sentences stay in the browser.

`start` and `end` are zero-based UTF-16 offsets relative to `sentence`, with an exclusive end. Validate `sentence.slice(start, end) === term` before lowercasing the term for vocabulary lookup. In “We write what we write.” the second “write” has range `[17, 22)`. Python backends need to convert UTF-16 offsets before indexing a string containing supplementary characters such as emoji.

### Successful response

Return HTTP `200` with `Content-Type: application/json`. This example uses the fixture’s illustrative scores.

```json
{
  "part": "verb",
  "alternatives": [
    { "name": "compose", "gloss": "Create a piece of writing", "score": 94 },
    { "name": "draft", "gloss": "Write a first version", "score": 88 }
  ]
}
```

| Field                  | What the backend returns                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `part`                 | The selected word’s part of speech in this sentence, such as `noun`, `verb`, or `adjective`.                          |
| `alternatives[].name`  | The replacement word to insert into the essay. Exclude the selected word and duplicate suggestions.                   |
| `alternatives[].gloss` | A short English explanation of the replacement. The service can join dictionary metadata to the model’s ranked words. |
| `alternatives[].score` | An integer from 0 to 100. The editor displays `96` as **96%**. Higher values indicate stronger word association.      |

For a cosine-based model, the proposed conversion is `score = round(100 × clamp(cosine_similarity, 0, 1))`. Filter candidates for sentence fit, then rank the remaining candidates by the original similarity before rounding and return them strongest first. Use the same scale across queries. The percentage describes similarity between words. Whether a replacement fits the sentence is the writer’s decision.

### Empty results and errors

| Situation                                                                            | HTTP status | JSON body                                             |
| ------------------------------------------------------------------------------------ | ----------- | ----------------------------------------------------- |
| Valid word outside the model vocabulary, or no suitable alternatives                 | `200`       | `null`                                                |
| Missing, blank, or multi-word `term`                                                 | `400`       | `{"error":"Expected a single word in term."}`         |
| Missing sentence, invalid offsets, or a range that does not select the supplied term | `400`       | `{"error":"Invalid selection in sentence."}`          |
| Model temporarily unavailable                                                        | `503`       | `{"error":"Word lookup is temporarily unavailable."}` |

The frontend uses `null` to show its empty state. A failed request shows a retry action.

### Connecting the frontend

Set `VITE_ALTERNATIVES_API_URL` to the **full endpoint URL**, for example `http://localhost:8000/api/v1/alternatives` in `.env.local`, then restart Vite. The [lookup adapter](src/features/thesaurus/thesaurus.ts) sends the POST request and consumes the response directly. Leaving the variable unset runs the local fixture.

For GitHub Pages, set the repository Actions variable of the same name to the HTTPS endpoint and rebuild. A cross-origin backend must allow the frontend origin, the POST method, and the `Content-Type` header on CORS preflight.

### AI-Usage

Used Codex GPT-Astra-6.2 for scaffolding Frontend prat of the project
