import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

# Load environment variables dari file .env (jika ada, saat dijalankan lokal)
load_dotenv()

# Inisialisasi aplikasi FastAPI
app = FastAPI(title="TU.AI API", description="API untuk project TU.AI di Google Cloud Run menggunakan Groq")

# Skema request untuk endpoint AI
class PromptRequest(BaseModel):
    prompt: str

@app.get("/")
def read_root():
    """
    Endpoint health check utama. 
    Google Cloud Run sering menggunakan endpoint '/' untuk mengecek apakah service sudah menyala (healthy).
    """
    return {"status": "ok", "message": "TU.AI Service is up and running!"}

@app.post("/generate")
def generate_text(request: PromptRequest):
    """
    Contoh integrasi dasar dengan library AI (Groq).
    Pastikan environment variable GROQ_API_KEY sudah diset di Google Cloud Run.
    """
    api_key = os.environ.get("GROQ_API_KEY")
    
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY environment variable is not set.")
        
    try:
        # Inisialisasi client Groq
        client = Groq(api_key=api_key)
        
        # Generate response menggunakan model Llama 3
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": request.prompt,
                }
            ],
            model="llama3-8b-8192",
        )
        
        return {
            "status": "success",
            "prompt": request.prompt,
            "result": chat_completion.choices[0].message.content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating AI response: {str(e)}")

# Opsional: Jika ingin menjalankan secara lokal dengan 'python main.py'
if __name__ == "__main__":
    import uvicorn
    # Saat di Cloud Run, environment variable PORT akan otomatis diisi.
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
