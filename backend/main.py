from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import uvicorn
import models
import schemas
from database import SessionLocal, engine
from services import property_service, valuation_service, export_service
from datetime import datetime

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Real Estate Valuation API",
    description="API for automated real estate valuation using comparative approach",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Property endpoints
@app.post("/api/properties/", response_model=schemas.Property)
def create_property(property: schemas.PropertyCreate, db: Session = Depends(get_db)):
    return property_service.create_property(db=db, property=property)

@app.get("/api/properties/", response_model=List[schemas.Property])
def get_properties(
    skip: int = 0,
    limit: int = 100,
    property_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return property_service.get_properties(
        db=db,
        skip=skip,
        limit=limit,
        property_type=property_type
    )

@app.get("/api/properties/{property_id}", response_model=schemas.Property)
def get_property(property_id: int, db: Session = Depends(get_db)):
    property = property_service.get_property(db=db, property_id=property_id)
    if property is None:
        raise HTTPException(status_code=404, detail="Property not found")
    return property

@app.put("/api/properties/{property_id}", response_model=schemas.Property)
def update_property(
    property_id: int,
    property: schemas.PropertyUpdate,
    db: Session = Depends(get_db)
):
    updated_property = property_service.update_property(
        db=db,
        property_id=property_id,
        property=property
    )
    if updated_property is None:
        raise HTTPException(status_code=404, detail="Property not found")
    return updated_property

@app.delete("/api/properties/{property_id}")
def delete_property(property_id: int, db: Session = Depends(get_db)):
    success = property_service.delete_property(db=db, property_id=property_id)
    if not success:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"message": "Property deleted successfully"}

# Valuation endpoints
@app.post("/api/valuation/calculate", response_model=schemas.ValuationResult)
def calculate_valuation(
    valuation: schemas.ValuationRequest,
    db: Session = Depends(get_db)
):
    try:
        result = valuation_service.calculate_valuation(
            db=db,
            subject_property=valuation.subject_property,
            comparable_properties=valuation.comparable_properties
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/valuation/history", response_model=List[schemas.ValuationHistory])
def get_valuation_history(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return valuation_service.get_valuation_history(
        db=db,
        skip=skip,
        limit=limit
    )

@app.get("/api/valuation/history/{history_id}", response_model=schemas.ValuationHistory)
def get_valuation_history_item(history_id: int, db: Session = Depends(get_db)):
    history_item = valuation_service.get_valuation_history_item(
        db=db,
        history_id=history_id
    )
    if history_item is None:
        raise HTTPException(status_code=404, detail="Valuation history item not found")
    return history_item

# Export endpoints
@app.post("/api/export/pdf")
async def export_to_pdf(valuation_data: schemas.ValuationResult):
    try:
        pdf_data = await export_service.generate_pdf(valuation_data)
        return {
            "filename": f"valuation_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
            "content": pdf_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/export/excel")
async def export_to_excel(valuation_data: schemas.ValuationResult):
    try:
        excel_data = await export_service.generate_excel(valuation_data)
        return {
            "filename": f"valuation_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx",
            "content": excel_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 