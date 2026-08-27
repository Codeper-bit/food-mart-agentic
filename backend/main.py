from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import AsyncGroq
import os
import json
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

client = AsyncGroq(
    api_key=os.getenv("GROQ_API_KEY")
)

# Store Information Context
FOODMART_CONTEXT = """
You are the AI Assistant for FoodMart. You answer customer questions briefly and politely.
Store Details:
- Locations: 12 Allen Avenue, Ikeja, Lagos AND 45 Admiralty Way, Lekki Phase 1, Lagos.
- Opening Hours: 8:00 AM - 10:00 PM daily.
- Delivery: Free on orders over ₦5,000.

Menu & Pricing:
- Jollof Rice: ₦1,800
- Fried Rice & Chicken: ₦2,500
- Egusi Soup: ₦3,200
- Puff Puff (10pcs): ₦600
- Chapman Drink: ₦900
- Grilled Chicken: ₦3,500
- Amala & Ewedu: ₦1,500
- Meat Pie: ₦500
- Ofe Onugbu: ₦2,800
- Zobo Drink: ₦700
- Turkey Laps: ₦4,500
- Eba & Okra: ₦1,200
"""


class ChatRequest(BaseModel):
    message: str


@app.post("/api/chat")
async def chat_with_ai(request: ChatRequest):
    try:
        response = await client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": FOODMART_CONTEXT},
                {"role": "user", "content": request.message}
            ],
            temperature=0.3
        )
        reply = response.choices[0].message.content
        return {"reply": reply}
    except Exception as e:
        print("Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
