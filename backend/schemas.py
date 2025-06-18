# backend/schemas.py
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

# Property schemas
class Location(BaseModel):
    lat: float
    lng: float

class PropertyFeature(BaseModel):
    name: str
    value: float
    unit: Optional[str] = None
    description: Optional[str] = None

class PropertyBase(BaseModel):
    address: str
    property_type: str
    area: float = Field(..., gt=0)
    floor_level: int
    total_floors: int
    condition: str
    renovation_status: str
    location: Location
    price: float = Field(..., gt=0)
    features: List[PropertyFeature]

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(BaseModel):
    address: Optional[str] = None
    property_type: Optional[str] = None
    area: Optional[float] = Field(None, gt=0)
    floor_level: Optional[int] = None
    total_floors: Optional[int] = None
    condition: Optional[str] = None
    renovation_status: Optional[str] = None
    location: Optional[Location] = None
    price: Optional[float] = Field(None, gt=0)
    features: Optional[List[PropertyFeature]] = None

class Property(PropertyBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: datetime

# Valuation schemas
class Adjustment(BaseModel):
    feature: str
    value: float
    description: Optional[str] = None

class ValuationRequest(BaseModel):
    subject_property: Property
    comparable_properties: List[Property]
    adjustment_criteria: Optional[Dict[str, Any]] = None

class ValuationResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    subject_property: Property
    comparable_properties: List[Property]
    adjustments: Dict[str, List[Adjustment]]
    final_valuation: float
    confidence_score: float
    created_at: datetime

class ValuationHistory(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    property_id: int
    valuation_date: datetime
    valuation_type: str
    original_price: float
    adjusted_price: float
    adjustments: Dict[str, Any]
    comparable_properties: List[int]
    created_by: str
    notes: Optional[str] = None

# User schemas
class UserBase(BaseModel):
    email: str
    username: str
    full_name: str
    role: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class User(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Adjustment coefficient schemas
class AdjustmentCoefficientBase(BaseModel):
    feature_name: str
    coefficient_value: float
    description: str
    is_active: bool = True

class AdjustmentCoefficientCreate(AdjustmentCoefficientBase):
    pass

class AdjustmentCoefficientUpdate(BaseModel):
    feature_name: Optional[str] = None
    coefficient_value: Optional[float] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class AdjustmentCoefficient(AdjustmentCoefficientBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: datetime
    created_by: str