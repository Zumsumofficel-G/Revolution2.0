from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
import hashlib
import jwt
import aiohttp
import base64
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
from urllib.parse import urlencode

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Discord Configuration
DISCORD_BOT_TOKEN = os.environ['DISCORD_BOT_TOKEN']
DISCORD_CLIENT_ID = os.environ['DISCORD_CLIENT_ID']
DISCORD_CLIENT_SECRET = os.environ['DISCORD_CLIENT_SECRET']
DISCORD_GUILD_ID = os.environ['DISCORD_GUILD_ID']
DISCORD_ADMIN_ROLE_ID = os.environ['DISCORD_ADMIN_ROLE_ID']
DISCORD_CHANNEL_ID = os.environ['DISCORD_CHANNEL_ID']
DISCORD_REDIRECT_URI = "https://dc72c7d2-1843-4123-8f8a-c0ac573233bd.preview.emergentagent.com/api/auth/discord/callback"

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
    role: str = "admin"  # admin, staff
    allowed_forms: List[str] = []  # form IDs this user can access
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None

class StaffUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    role: str = "staff"
    allowed_forms: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str

class DiscordUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    discord_id: str
    discord_username: str
    discord_avatar: Optional[str] = None
    discord_discriminator: Optional[str] = None
    is_admin: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: datetime = Field(default_factory=datetime.utcnow)

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminCreate(BaseModel):
    username: str
    password: str
    role: str = "admin"  # admin or staff
    allowed_forms: List[str] = []

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    allowed_forms: Optional[List[str]] = None

class Changelog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    version: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str

class ChangelogCreate(BaseModel):
    title: str
    content: str
    version: Optional[str] = None

class DiscordNews(BaseModel):
    id: str
    content: str
    author_username: str
    author_avatar: Optional[str] = None
    timestamp: str
    attachments: List[Dict[str, Any]] = []

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
    applicant_discord_id: Optional[str] = None
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

class DiscordMessage(BaseModel):
    id: str
    content: str
    author_username: str
    author_avatar: Optional[str] = None
    timestamp: str
    attachments: List[Dict[str, Any]] = []

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
        user_type = payload.get("type", "admin")
        
        if user_type == "admin":
            username = payload.get("sub")
            if username is None:
                raise HTTPException(status_code=401, detail="Invalid token")
            
            admin = await db.admin_users.find_one({"username": username})
            if admin is None:
                raise HTTPException(status_code=401, detail="Admin not found")
            
            return {"user": AdminUser(**admin), "type": "admin"}
        else:  # Discord user
            discord_id = payload.get("sub")
            if discord_id is None:
                raise HTTPException(status_code=401, detail="Invalid token")
            
            user = await db.discord_users.find_one({"discord_id": discord_id})
            if user is None:
                raise HTTPException(status_code=401, detail="User not found")
            
            return {"user": DiscordUser(**user), "type": "discord"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user (admin or discord user)"""
    return await get_current_admin(credentials)

async def require_admin_access(current_user = Depends(get_current_user)):
    """Require full admin access - only admin role users"""
    if current_user["type"] == "admin" and current_user["user"].role == "admin":
        return current_user["user"]
    elif current_user["type"] == "discord" and current_user["user"].is_admin:
        return current_user["user"]
    else:
        raise HTTPException(status_code=403, detail="Admin access required")

async def require_staff_or_admin_access(current_user = Depends(get_current_user)):
    """Require staff or admin access - for managing submissions"""
    if current_user["type"] == "admin" and current_user["user"].role in ["admin", "staff"]:
        return current_user["user"]
    elif current_user["type"] == "discord" and current_user["user"].is_admin:
        return current_user["user"]
    else:
        raise HTTPException(status_code=403, detail="Staff or admin access required")

async def require_form_access(form_id: str, current_user = Depends(get_current_user)):
    """Check if user has access to specific form"""
    if current_user["type"] == "admin":
        user = current_user["user"]
        # Admin role has access to all forms
        if user.role == "admin":
            return user
        # Staff role needs specific form access
        elif user.role == "staff" and form_id in user.allowed_forms:
            return user
    elif current_user["type"] == "discord" and current_user["user"].is_admin:
        return current_user["user"]
    
    raise HTTPException(status_code=403, detail="Access denied for this form")

# Discord API helper functions
async def get_discord_user_info(access_token: str):
    """Get Discord user info from access token"""
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        response = await client.get("https://discord.com/api/v10/users/@me", headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(status_code=401, detail="Invalid Discord token")

async def get_discord_user_guilds(access_token: str):
    """Get Discord user's guilds"""
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        response = await client.get("https://discord.com/api/v10/users/@me/guilds", headers=headers)
        if response.status_code == 200:
            return response.json()
        return []

async def check_user_admin_role(discord_user_id: str):
    """Check if Discord user has admin role using bot token"""
    headers = {"Authorization": f"Bot {DISCORD_BOT_TOKEN}"}
    async with httpx.AsyncClient() as client:
        try:
            # Get guild member info
            response = await client.get(
                f"https://discord.com/api/v10/guilds/{DISCORD_GUILD_ID}/members/{discord_user_id}",
                headers=headers
            )
            if response.status_code == 200:
                member_data = response.json()
                user_roles = member_data.get("roles", [])
                return DISCORD_ADMIN_ROLE_ID in user_roles
        except Exception as e:
            logging.error(f"Error checking user roles: {e}")
        return False

async def get_discord_channel_messages():
    """Get messages from Discord channel using bot token"""
    headers = {"Authorization": f"Bot {DISCORD_BOT_TOKEN}"}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"https://discord.com/api/v10/channels/{DISCORD_CHANNEL_ID}/messages?limit=50",
                headers=headers
            )
            if response.status_code == 200:
                messages_data = response.json()
                messages = []
                for msg in messages_data:
                    messages.append(DiscordMessage(
                        id=msg["id"],
                        content=msg["content"],
                        author_username=msg["author"]["username"],
                        author_avatar=msg["author"].get("avatar"),
                        timestamp=msg["timestamp"],
                        attachments=msg.get("attachments", [])
                    ))
                return messages
        except Exception as e:
            logging.error(f"Error fetching Discord messages: {e}")
        return []

# Initialize default admin if not exists
async def init_default_admin():
    existing_admin = await db.admin_users.find_one({"username": "admin"})
    if not existing_admin:
        default_admin = AdminUser(
            username="admin",
            password_hash=hash_password("admin123"),
            role="admin"
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

# Discord Messages
@api_router.get("/discord/messages", response_model=List[DiscordMessage])
async def get_discord_messages():
    """Get messages from the Discord channel"""
    return await get_discord_channel_messages()

# Discord OAuth2 endpoints
@api_router.get("/auth/discord/login")
async def discord_oauth_login():
    """Initiate Discord OAuth2 login"""
    scope = "identify guilds"
    discord_login_url = f"https://discord.com/api/oauth2/authorize?" + urlencode({
        "client_id": DISCORD_CLIENT_ID,
        "redirect_uri": DISCORD_REDIRECT_URI,
        "response_type": "code",
        "scope": scope
    })
    return {"login_url": discord_login_url}

@api_router.get("/auth/discord/callback")
async def discord_oauth_callback(code: str):
    """Handle Discord OAuth2 callback"""
    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://discord.com/api/oauth2/token",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data={
                "client_id": DISCORD_CLIENT_ID,
                "client_secret": DISCORD_CLIENT_SECRET,
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": DISCORD_REDIRECT_URI
            }
        )
        
        if token_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get access token")
        
        token_data = token_response.json()
        access_token = token_data["access_token"]
        
        # Get user info
        user_info = await get_discord_user_info(access_token)
        discord_id = user_info["id"]
        
        # Check if user has admin role
        is_admin = await check_user_admin_role(discord_id)
        
        # Create or update user in database
        existing_user = await db.discord_users.find_one({"discord_id": discord_id})
        user_data = {
            "discord_id": discord_id,
            "discord_username": user_info["username"],
            "discord_avatar": user_info.get("avatar"),
            "discord_discriminator": user_info.get("discriminator"),
            "is_admin": is_admin,
            "last_login": datetime.utcnow()
        }
        
        if existing_user:
            await db.discord_users.update_one(
                {"discord_id": discord_id},
                {"$set": user_data}
            )
            user_data["id"] = existing_user["id"]
            user_data["created_at"] = existing_user["created_at"]
        else:
            user_data["id"] = str(uuid.uuid4())
            user_data["created_at"] = datetime.utcnow()
            await db.discord_users.insert_one(user_data)
        
        # Create JWT token
        token = create_access_token({
            "sub": discord_id,
            "type": "discord",
            "is_admin": is_admin
        })
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user_data,
            "is_admin": is_admin
        }

# Legacy admin auth endpoints
@api_router.post("/admin/login")
async def admin_login(login_data: AdminLogin):
    admin = await db.admin_users.find_one({"username": login_data.username})
    if not admin or not verify_password(login_data.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token({
        "sub": admin["username"], 
        "type": "admin",
        "role": admin.get("role", "admin")
    })
    return {"access_token": access_token, "token_type": "bearer", "role": admin.get("role", "admin")}

@api_router.post("/admin/create-user")
async def create_user(admin_data: AdminCreate, current_admin = Depends(require_admin_access)):
    # Check if username exists
    existing = await db.admin_users.find_one({"username": admin_data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_user = AdminUser(
        username=admin_data.username,
        password_hash=hash_password(admin_data.password),
        role=admin_data.role,
        created_by=getattr(current_admin, 'username', 'discord_user')
    )
    
    await db.admin_users.insert_one(new_user.dict())
    return {"message": f"{'Admin' if admin_data.role == 'admin' else 'Staff'} user created successfully"}

@api_router.get("/admin/users")
async def get_admin_users(current_admin = Depends(require_admin_access)):
    users = await db.admin_users.find().to_list(1000)
    return [
        {
            "id": user["id"], 
            "username": user["username"], 
            "role": user.get("role", "admin"), 
            "created_at": user["created_at"],
            "created_by": user.get("created_by", "system")
        } 
        for user in users
    ]

@api_router.delete("/admin/users/{user_id}")
async def delete_admin_user(user_id: str, current_admin = Depends(require_admin_access)):
    # Don't allow deleting yourself
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    # Don't allow deleting the default admin
    user_to_delete = await db.admin_users.find_one({"id": user_id})
    if user_to_delete and user_to_delete["username"] == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete default admin account")
    
    result = await db.admin_users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}

@api_router.put("/admin/users/{user_id}/role")
async def update_user_role(user_id: str, role_data: dict, current_admin = Depends(require_admin_access)):
    new_role = role_data.get("role")
    if new_role not in ["admin", "staff"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    # Don't allow changing your own role
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
    
    result = await db.admin_users.update_one(
        {"id": user_id},
        {"$set": {"role": new_role}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User role updated successfully"}

@api_router.get("/user/me")
async def get_current_user_info(current_user = Depends(get_current_user)):
    if current_user["type"] == "admin":
        return {
            "type": "admin",
            "username": current_user["user"].username,
            "role": current_user["user"].role,
            "created_at": current_user["user"].created_at,
            "is_admin": current_user["user"].role == "admin",
            "is_staff": current_user["user"].role in ["admin", "staff"]
        }
    else:
        user = current_user["user"]
        return {
            "type": "discord",
            "discord_id": user.discord_id,
            "discord_username": user.discord_username,
            "discord_avatar": user.discord_avatar,
            "is_admin": user.is_admin,
            "created_at": user.created_at
        }

# User dashboard - get user's applications
@api_router.get("/user/applications", response_model=List[ApplicationSubmission])
async def get_user_applications(current_user = Depends(get_current_user)):
    if current_user["type"] == "discord":
        # Get applications for Discord user
        submissions = await db.application_submissions.find({
            "applicant_discord_id": current_user["user"].discord_id
        }).sort("submitted_at", -1).to_list(1000)
        return [ApplicationSubmission(**sub) for sub in submissions]
    else:
        # Admin users see all applications
        submissions = await db.application_submissions.find().sort("submitted_at", -1).to_list(1000)
        return [ApplicationSubmission(**sub) for sub in submissions]

# Application Form endpoints (admin only)
@api_router.post("/admin/application-forms", response_model=ApplicationForm)
async def create_application_form(form_data: ApplicationFormCreate, current_admin = Depends(require_admin_access)):
    # Get the created_by field based on user type
    if hasattr(current_admin, 'username'):
        created_by = current_admin.username
    elif hasattr(current_admin, 'discord_username'):
        created_by = current_admin.discord_username
    else:
        created_by = "unknown"
    
    form = ApplicationForm(
        **form_data.dict(), 
        created_by=created_by
    )
    await db.application_forms.insert_one(form.dict())
    return form

@api_router.get("/admin/application-forms", response_model=List[ApplicationForm])
async def get_admin_application_forms(current_admin = Depends(require_admin_access)):
    forms = await db.application_forms.find().to_list(1000)
    return [ApplicationForm(**form) for form in forms]

@api_router.get("/admin/application-forms/{form_id}", response_model=ApplicationForm)
async def get_admin_application_form(form_id: str, current_admin = Depends(require_admin_access)):
    form = await db.application_forms.find_one({"id": form_id})
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return ApplicationForm(**form)

@api_router.put("/admin/application-forms/{form_id}")
async def update_application_form(form_id: str, form_data: ApplicationFormCreate, current_admin = Depends(require_admin_access)):
    result = await db.application_forms.update_one(
        {"id": form_id},
        {"$set": form_data.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Form not found")
    return {"message": "Form updated successfully"}

@api_router.delete("/admin/application-forms/{form_id}")
async def delete_application_form(form_id: str, current_admin = Depends(require_admin_access)):
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
async def get_admin_submissions(current_admin = Depends(require_staff_or_admin_access)):
    submissions = await db.application_submissions.find().sort("submitted_at", -1).to_list(1000)
    return [ApplicationSubmission(**sub) for sub in submissions]

@api_router.get("/admin/submissions/{submission_id}", response_model=ApplicationSubmission)
async def get_admin_submission(submission_id: str, current_admin = Depends(require_staff_or_admin_access)):
    submission = await db.application_submissions.find_one({"id": submission_id})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return ApplicationSubmission(**submission)

@api_router.put("/admin/submissions/{submission_id}/status")
async def update_submission_status(submission_id: str, status: dict, current_admin = Depends(require_staff_or_admin_access)):
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