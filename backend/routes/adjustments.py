# backend/routes/adjustments.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
from database import get_db
from services.user_service import user_service
from services.adjustment_service import adjustment_service

router = APIRouter(prefix="/api/adjustments", tags=["adjustments"])

@router.get("/coefficients", response_model=List[schemas.AdjustmentCoefficient])
def get_adjustment_coefficients(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(user_service.get_current_user)
):
    """
    Получить список коэффициентов корректировки
    """
    coefficients = adjustment_service.get_coefficients(
        db=db,
        skip=skip,
        limit=limit,
        active_only=active_only
    )
    return coefficients

@router.post("/coefficients", response_model=schemas.AdjustmentCoefficient)
def create_adjustment_coefficient(
    coefficient: schemas.AdjustmentCoefficientCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(user_service.get_current_user)
):
    """
    Создать новый коэффициент корректировки
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только администраторы могут создавать коэффициенты"
        )
    
    return adjustment_service.create_coefficient(
        db=db,
        coefficient=coefficient,
        user_id=current_user.id
    )

@router.get("/coefficients/{coefficient_id}", response_model=schemas.AdjustmentCoefficient)
def get_adjustment_coefficient(
    coefficient_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(user_service.get_current_user)
):
    """
    Получить коэффициент корректировки по ID
    """
    coefficient = adjustment_service.get_coefficient(db=db, coefficient_id=coefficient_id)
    if not coefficient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Коэффициент не найден"
        )
    return coefficient

@router.put("/coefficients/{coefficient_id}", response_model=schemas.AdjustmentCoefficient)
def update_adjustment_coefficient(
    coefficient_id: int,
    coefficient_update: schemas.AdjustmentCoefficientUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(user_service.get_current_user)
):
    """
    Обновить коэффициент корректировки
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только администраторы могут изменять коэффициенты"
        )
    
    coefficient = adjustment_service.update_coefficient(
        db=db,
        coefficient_id=coefficient_id,
        coefficient_update=coefficient_update
    )
    
    if not coefficient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Коэффициент не найден"
        )
    
    return coefficient

@router.delete("/coefficients/{coefficient_id}")
def delete_adjustment_coefficient(
    coefficient_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(user_service.get_current_user)
):
    """
    Удалить коэффициент корректировки
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только администраторы могут удалять коэффициенты"
        )
    
    success = adjustment_service.delete_coefficient(db=db, coefficient_id=coefficient_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Коэффициент не найден"
        )
    
    return {"message": "Коэффициент успешно удален"}

@router.post("/coefficients/{coefficient_id}/deactivate", response_model=schemas.AdjustmentCoefficient)
def deactivate_adjustment_coefficient(
    coefficient_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(user_service.get_current_user)
):
    """
    Деактивировать коэффициент корректировки
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только администраторы могут деактивировать коэффициенты"
        )
    
    coefficient = adjustment_service.deactivate_coefficient(db=db, coefficient_id=coefficient_id)
    
    if not coefficient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Коэффициент не найден"
        )
    
    return coefficient

@router.get("/coefficients/feature/{feature_name}", response_model=schemas.AdjustmentCoefficient)
def get_coefficient_by_feature(
    feature_name: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(user_service.get_current_user)
):
    """
    Получить коэффициент по названию характеристики
    """
    coefficient = adjustment_service.get_coefficient_by_feature(
        db=db,
        feature_name=feature_name
    )
    
    if not coefficient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Коэффициент для характеристики '{feature_name}' не найден"
        )
    
    return coefficient

@router.post("/apply", response_model=List[schemas.Adjustment])
def apply_adjustments(
    property_features: List[schemas.PropertyFeature],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(user_service.get_current_user)
):
    """
    Применить коэффициенты корректировки к характеристикам объекта
    """
    adjustments = adjustment_service.apply_coefficients(
        db=db,
        property_features=property_features
    )
    return adjustments

@router.post("/validate", response_model=dict)
def validate_coefficients(
    coefficients: List[schemas.AdjustmentCoefficientCreate],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(user_service.get_current_user)
):
    """
    Валидировать коэффициенты корректировки
    """
    errors = adjustment_service.validate_coefficients(db=db, coefficients=coefficients)
    
    return {
        "valid": len(errors) == 0,
        "errors": errors
    }

# Добавляем router в main.py
# app.include_router(adjustments.router)