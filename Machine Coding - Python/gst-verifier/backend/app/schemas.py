from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GSTInfoSchema(BaseModel):
    gstin: str
    business_name: str
    status: str
    state: str
    registration_date: Optional[str] = None
    taxpayer_type: Optional[str] = None
    address: Optional[str] = None
    
    class Config:
        from_attributes = True

class SearchHistorySchema(BaseModel):
    id: int
    gst_in: str
    business_name: str
    status: str
    state: str
    searched_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True