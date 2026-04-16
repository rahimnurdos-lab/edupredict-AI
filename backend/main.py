from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import torch
from .model import get_model
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="EduPredict Local Math Engine")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class GradeRequest(BaseModel):
    grades: List[float]

# Initialize model
input_size = 5 # Assuming we take last 5 grades for prediction
model = get_model(input_size=input_size)
model.eval()

@app.get("/")
def read_root():
    return {"status": "EduPredict Math Engine is running"}

@app.post("/api/predict")
async def predict_grade(request: GradeRequest):
    try:
        # Prepare inputs (take last 5 grades, pad with 0 if fewer)
        grades = request.grades[-input_size:]
        while len(grades) < input_size:
            grades.insert(0, 0.0)
        
        # Convert to tensor
        input_tensor = torch.tensor([grades], dtype=torch.float32)
        
        # Prediction
        with torch.no_grad():
            prediction = model(input_tensor)
            score = prediction.item()
            
        # Clamp score between 1 and 10
        final_score = max(1.0, min(10.0, round(score * 10) / 10))
        
        return {
            "prediction": final_score,
            "engine": "PyTorch Neural Network"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
