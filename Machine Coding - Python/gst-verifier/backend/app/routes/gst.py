# Import Relevant Modules
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import GSTInfoSchema, SearchHistorySchema
from ..models import SearchHistory
from ..services.mock_gst import verify_gstin

# Seting the Router
router = APIRouter(prefix="/api/gst", tags=["GST Verifier"])

# First Endpoint: Verfiy GSTIn
@router.get("/verify/{gstin}", response_model = GSTInfoSchema)
def verify_gst(gstin:str, db: Session = Depends(get_db)):
    gst_info = verify_gstin(gstin)

    if not gst_info:
        raise HTTPException(status_code=404, detail="GSTIN not found")

    search_history = SearchHistory(gst_in=gstin, business_name=gst_info["business_name"], status=gst_info["status"], state=gst_info["state"])

    db.add(search_history)
    db.commit()
    db.refresh(search_history)
    
    return gst_info

# Second Endpoint: Get Search History
@router.get("/history", response_model = list[SearchHistorySchema])
def get_history(db: Session = Depends(get_db)):

    search_history = db.query(SearchHistory).order_by(SearchHistory.search_at.desc()).all()
    
    return search_history

# Third Endpoint: Delete History Item
@router.delete("/history/{id}")
def delete_history(id: int, db: Session = Depends(get_db)):
    
    history_item = db.query(SearchHistory).filter(SearchHistory.id == id).first()

    if history_item is None:
        raise HTTPException(status_code=404, detail="History item not found")
    
    db.delete(history_item)
    db.commit()
    
    return {"message": "History item deleted successfully"}
