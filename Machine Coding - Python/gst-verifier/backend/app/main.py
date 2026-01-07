# Importing Required Modules
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Creating FastAPI Instance
app = FastAPI(title="GST Verifier", description="API for GST Verification", version="1.0.0")

# Adding CORS Middleware
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_headers=['*'], allow_methods=['*'])

# Including Router
# app.include_router()

# Root Route
@app.get("/", tags=["Root"])
async def root():
    return {"message": "Welcome to GST Verifier API", "status": "running"}