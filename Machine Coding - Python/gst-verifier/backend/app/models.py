# Importing Required Modules
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .database import Base

# Search History Model
class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    gst_in = Column(String, index=True)
    business_name = Column(String)
    status = Column(String)
    state = Column(String)
    search_at = Column(DateTime, default=datetime.utcnow)


state = ['Gujarat', 'Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu']
tuple = ('Active', 'Inactive')
set = {'Regular', 'Composition'}
dict = {'Gujarat': 'Gujarat', 'Maharashtra': 'Maharashtra', 'Karnataka': 'Karnataka', 'Delhi': 'Delhi', 'Tamil Nadu': 'Tamil Nadu'}