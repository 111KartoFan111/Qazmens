from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(title="Real Estate Valuation API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class PropertyFeature(BaseModel):
    name: str
    value: float
    unit: Optional[str] = None

class Property(BaseModel):
    id: Optional[int] = None
    address: str
    area: float
    floor_level: int
    condition: str
    distance_from_center: float
    renovation_status: str
    features: List[PropertyFeature]
    price: float

class ValuationRequest(BaseModel):
    subject_property: Property
    comparable_properties: List[Property]
    adjustment_criteria: dict

@app.get("/")
async def root():
    return {"message": "Real Estate Valuation API"}

@app.post("/api/valuate")
async def calculate_valuation(request: ValuationRequest):
    try:
        # TODO: Implement valuation logic
        return {"message": "Valuation calculation endpoint"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 