from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
import re
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class Message(BaseModel):
    text: str

def clean_markdown(text: str) -> str:
    """Hapus karakter markdown seperti **, *, _, dan ```"""
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)  # **bold**
    text = re.sub(r"\*(.*?)\*", r"\1", text)      # *italic*
    text = re.sub(r"_(.*?)_", r"\1", text)        # _italic_
    text = re.sub(r"`(.*?)`", r"\1", text)        # `code`
    text = re.sub(r"#+\s?", "", text)             # # heading
    text = re.sub(r"\n{2,}", "\n", text)          # hapus newline berlebih
    return text.strip()

@app.post("/chat")
async def chat(msg: Message):
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(msg.text)
        cleaned_text = clean_markdown(response.text)
        return {"reply": cleaned_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def home():
    return {"message": "Chat AI Backend is running 🚀"}
