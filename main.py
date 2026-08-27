from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import fitz
import io
import os
from groq import Groq
from dotenv import load_dotenv
from fastapi.responses import FileResponse
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
import json
from pydantic import BaseModel

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


class question(BaseModel):
    question: str


client = Groq(api_key=os.getenv("GROQ_API_KEY"))


@app.post("/ask_xion")
async def check_portfolio():
    try:
        print("calling groq...")
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are CODEPER-BIT portfolio reviewer. You must respond ONLY with raw, valid JSON. "
                        "Do NOT wrap the JSON inside markdown tags like ```json ... ```. "
                        "Do NOT provide conversational text or commentary."
                    )
                },
                {
                    "role": "user",
                    "content": f"""
                            Analyse this resume.
                            Return ONLY a valid JSON object matching this exact schema:
                            {{
                                "tech_stack": [],
                                "frameworks": [],
                                "languages": [],
                                "job_match": [],
                                "why_choose_me": []
                            }}
                            Resume content:
                            {text}
                        """
                }
            ],
            temperature=0
        )
        global last_analysis
        last_analysis = json.loads(response.choices[0].message.content)
        return {"analysis": response.choices[0].message.content}
    except Exception as e:
        print("Groq Error:", e)
        return {"error": str(e)}

        return analysis

    print(data)


@app.post("/export")
async def export():
    global last_analysis

    if not last_analysis:
        return {"error": "No analysis found"}

    doc = SimpleDocTemplate("Resume_Report.pdf")
    styles = getSampleStyleSheet()

    story = []
    story.append(Paragraph("Resume Analysis Report",
                           styles["Heading1"]))
    story.append(
        Paragraph(f"ATS Score: {last_analysis['score']}", styles["Normal"]))
    story.append(
        Paragraph(f"Job Match: {last_analysis['job_match']}", styles["Normal"]))
    story.append(
        Paragraph(f"Strength: {last_analysis['strength']}", styles["Normal"]))
    story.append(
        Paragraph(f"Weakness: {last_analysis['weakness']}", styles["Normal"]))
    story.append(
        Paragraph(f"Misssing Skills: {last_analysis['missing_skills']}", styles["Normal"]))
    story.append(
        Paragraph(f"Suggestion: {last_analysis['suggestions']}", styles["Normal"]))

    doc.build(story)
    return FileResponse(
        "Resume_Report.pdf",
        filename="Resume_Report.pdf",
        media_type="application/pdf"
    )
    analysis = json.load(response)
