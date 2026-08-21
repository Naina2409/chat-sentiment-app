from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI(title="Sentiment ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Loaded once at startup. This model is a RoBERTa transformer fine-tuned
# specifically on short informal text (tweets), which matches chat
# messages closely. Outputs three classes with a genuine confidence score,
# rather than a rule-based word-count heuristic.
classifier = pipeline(
    "sentiment-analysis",
    model="cardiffnlp/twitter-roberta-base-sentiment-latest",
)


class TextInput(BaseModel):
    text: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
def analyze(input: TextInput):
    result = classifier(input.text)[0]
    label = result["label"].lower()
    confidence = round(result["score"], 4)

    # Signed score for trend visualization:
    # positive -> +confidence, negative -> -confidence, neutral -> 0
    if label == "positive":
        signed_score = confidence
    elif label == "negative":
        signed_score = -confidence
    else:
        signed_score = 0.0

    return {"label": label, "score": signed_score, "confidence": confidence}