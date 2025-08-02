from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
import hashlib
import jwt
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# JWT Configuration
JWT_SECRET = "revolution_roleplay_secret_key_2025"
JWT_ALGORITHM = "HS256"
security = HTTPBearer()

# Models
class AdminUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminCreate(BaseModel):
    username: str
    password: str

class ApplicationFormField(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    label: str
    field_type: str  # text, textarea, select, radio, checkbox
    options: Optional[List[str]] = None
    required: bool = False
    placeholder: Optional[str] = None

class ApplicationForm(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    position: str  # What they're applying for
    fields: List[ApplicationFormField]
    webhook_url: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str

class ApplicationFormCreate(BaseModel):
    title: str
    description: str
    position: str
    fields: List[ApplicationFormField]
    webhook_url: Optional[str] = None

class ApplicationSubmission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    form_id: str
    applicant_name: str
    responses: Dict[str, Any]
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "pending"  # pending, approved, rejected

class ApplicationSubmit(BaseModel):
    form_id: str
    applicant_name: str
    responses: Dict[str, Any]

class ServerStats(BaseModel):
    players: int
    max_players: int
    hostname: str
    gametype: str

# Helper functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hashlib.sha256(password.encode()).hexdigest() == hashed

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        admin = await db.admin_users.find_one({"username": username})
        if admin is None:
            raise HTTPException(status_code=401, detail="Admin not found")
        
        return AdminUser(**admin)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Initialize default admin if not exists
async def init_default_admin():
    existing_admin = await db.admin_users.find_one({"username": "admin"})
    if not existing_admin:
        default_admin = AdminUser(
            username="admin",
            password_hash=hash_password("admin123")
        )
        await db.admin_users.insert_one(default_admin.dict())
        logging.info("Default admin user created: admin/admin123")

@app.on_event("startup")
async def startup_event():
    await init_default_admin()

# FiveM Server Stats
@api_router.get("/server-stats", response_model=ServerStats)
async def get_server_stats():
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get("http://45.84.198.57:30120/dynamic.json")
            data = response.json()
            return ServerStats(
                players=data.get("clients", 0),
                max_players=int(data.get("sv_maxclients", 64)),
                hostname=data.get("hostname", "Revolution Roleplay"),
                gametype=data.get("gametype", "ESX Legacy")
            )
    except Exception as e:
        logging.error(f"Failed to fetch server stats: {e}")
        return ServerStats(
            players=0,
            max_players=64,
            hostname="Revolution Roleplay",
            gametype="ESX Legacy"
        )

# Auth endpoints
@api_router.post("/admin/login")
async def admin_login(login_data: AdminLogin):
    admin = await db.admin_users.find_one({"username": login_data.username})
    if not admin or not verify_password(login_data.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token({"sub": admin["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/admin/create-admin")
async def create_admin(admin_data: AdminCreate, current_admin: AdminUser = Depends(get_current_admin)):
    # Check if username exists
    existing = await db.admin_users.find_one({"username": admin_data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_admin = AdminUser(
        username=admin_data.username,
        password_hash=hash_password(admin_data.password),
        created_by=current_admin.username
    )
    
    await db.admin_users.insert_one(new_admin.dict())
    return {"message": "Admin user created successfully"}

@api_router.get("/admin/me")
async def get_current_admin_info(current_admin: AdminUser = Depends(get_current_admin)):
    return {"username": current_admin.username, "created_at": current_admin.created_at}

# Application Form endpoints
@api_router.post("/admin/application-forms", response_model=ApplicationForm)
async def create_application_form(form_data: ApplicationFormCreate, current_admin: AdminUser = Depends(get_current_admin)):
    form = ApplicationForm(**form_data.dict(), created_by=current_admin.username)
    await db.application_forms.insert_one(form.dict())
    return form

@api_router.get("/admin/application-forms", response_model=List[ApplicationForm])
async def get_admin_application_forms(current_admin: AdminUser = Depends(get_current_admin)):
    forms = await db.application_forms.find().to_list(1000)
    return [ApplicationForm(**form) for form in forms]

@api_router.get("/admin/application-forms/{form_id}", response_model=ApplicationForm)
async def get_admin_application_form(form_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    form = await db.application_forms.find_one({"id": form_id})
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return ApplicationForm(**form)

@api_router.put("/admin/application-forms/{form_id}")
async def update_application_form(form_id: str, form_data: ApplicationFormCreate, current_admin: AdminUser = Depends(get_current_admin)):
    result = await db.application_forms.update_one(
        {"id": form_id},
        {"$set": form_data.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Form not found")
    return {"message": "Form updated successfully"}

@api_router.delete("/admin/application-forms/{form_id}")
async def delete_application_form(form_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    result = await db.application_forms.delete_one({"id": form_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Form not found")
    return {"message": "Form deleted successfully"}

# Public Application endpoints
@api_router.get("/applications", response_model=List[ApplicationForm])
async def get_public_applications():
    forms = await db.application_forms.find({"is_active": True}).to_list(1000)
    return [ApplicationForm(**form) for form in forms]

@api_router.get("/applications/{form_id}", response_model=ApplicationForm)
async def get_public_application(form_id: str):
    form = await db.application_forms.find_one({"id": form_id, "is_active": True})
    if not form:
        raise HTTPException(status_code=404, detail="Application not found")
    return ApplicationForm(**form)

@api_router.post("/applications/submit")
async def submit_application(submission: ApplicationSubmit):
    # Verify form exists and is active
    form = await db.application_forms.find_one({"id": submission.form_id, "is_active": True})
    if not form:
        raise HTTPException(status_code=404, detail="Application form not found")
    
    # Create submission
    submission_obj = ApplicationSubmission(**submission.dict())
    await db.application_submissions.insert_one(submission_obj.dict())
    
    # Send Discord webhook if configured
    if form.get("webhook_url"):
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                webhook_data = {
                    "embeds": [{
                        "title": f"Ny ansøgning - {form['title']}",
                        "description": f"**Ansøger:** {submission.applicant_name}\n**Position:** {form['position']}",
                        "color": 7289935,  # Discord purple
                        "fields": [
                            {"name": field["label"], "value": str(submission.responses.get(field["id"], "N/A")), "inline": True}
                            for field in form["fields"][:10]  # Limit to 10 fields for Discord
                        ],
                        "timestamp": submission_obj.submitted_at.isoformat(),
                        "footer": {"text": "Revolution Roleplay"}
                    }]
                }
                await client.post(form["webhook_url"], json=webhook_data)
        except Exception as e:
            logging.error(f"Failed to send webhook: {e}")
    
    return {"message": "Application submitted successfully", "submission_id": submission_obj.id}

# Admin application management
@api_router.get("/admin/submissions", response_model=List[ApplicationSubmission])
async def get_admin_submissions(current_admin: AdminUser = Depends(get_current_admin)):
    submissions = await db.application_submissions.find().sort("submitted_at", -1).to_list(1000)
    return [ApplicationSubmission(**sub) for sub in submissions]

@api_router.get("/admin/submissions/{submission_id}", response_model=ApplicationSubmission)
async def get_admin_submission(submission_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    submission = await db.application_submissions.find_one({"id": submission_id})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return ApplicationSubmission(**submission)

@api_router.put("/admin/submissions/{submission_id}/status")
async def update_submission_status(submission_id: str, status: dict, current_admin: AdminUser = Depends(get_current_admin)):
    result = await db.application_submissions.update_one(
        {"id": submission_id},
        {"$set": {"status": status.get("status", "pending")}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"message": "Status updated successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()