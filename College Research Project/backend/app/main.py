from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="PromptShield",
    description="LLM Security Testing Platform - Red Team Your Models",
    version="1.0.0"
)

