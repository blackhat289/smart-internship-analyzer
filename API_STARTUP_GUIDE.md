# API Startup & 404 Error Fix

## Problem Fixed ✅
The 404 "Not Found" error at `localhost:8000` has been resolved.

**Root Cause**: The ML service API was missing a GET `/` (root) endpoint.

**Solution**: Added a root endpoint that returns:
- API service information
- Available endpoints list
- Links to interactive documentation (/docs)
- OpenAPI specification (/openapi.json)

---

## API Endpoints

### ML Service (Port 8000) - FastAPI

**Root & Health**
- `GET /` - API overview and endpoints list
- `GET /health` - Health check

**Resume Analysis**
- `POST /extract` - Extract resume data from PDF/DOCX
- `POST /extract-skills` - Extract skills from resume text
- `POST /analyze` - Analyze resume and identify skill gaps
- `POST /match-internship` - Match resume to internship roles
- `POST /recommend` - Get personalized recommendations

**Documentation**
- `GET /docs` - Interactive Swagger UI
- `GET /openapi.json` - OpenAPI specification

---

## How to Start Services

### 1. ML Service (Port 8000)
```powershell
cd ml-service
$env:PYTHONPATH = "$pwd"
python -m uvicorn app.main:app --reload --port 8000
```

**Access**:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- OpenAPI: http://localhost:8000/openapi.json

### 2. Backend (Port 5000)
```powershell
cd backend
npm install      # First time only
npm start        # Or: npm run dev (with auto-reload)
```

**Note**: Backend requires MongoDB. It will start without DB but some features won't work.

**Access**:
- API: http://localhost:5000
- Health: http://localhost:5000/health

**Available Routes**:
- `/api/auth/*` - Authentication
- `/api/profile/*` - User profiles
- `/api/resume/*` - Resume management
- `/api/analysis/*` - Analysis endpoints
- `/api/recommendations/*` - Recommendations

### 3. Frontend (Port 5173)
```powershell
cd frontend
npm install      # First time only
npm run dev      # Development with Vite
```

**Access**: http://localhost:5173

---

## Configuration

### ML Service (ml-service/app/config.py)
- Embedding Model: `all-MiniLM-L6-v2` (384 dimensions)
- Knowledge Base: `ml-service/knowledge_base/`
- FAISS Index: `ml-service/knowledge_base/faiss.index`
- FAISS Metadata: `ml-service/knowledge_base/faiss_meta.json`

### Backend (backend/src/config/env.js)
- MongoDB: `mongodb://127.0.0.1:27017/smart-internship-analyzer`
- JWT Secret: Set via `JWT_SECRET` env variable
- Port: `5000` (set via `PORT` env variable)

---

## Example API Calls

### Extract Resume
```bash
curl -X POST http://localhost:8000/extract \
  -F "file=@resume.pdf"
```

### Analyze Resume
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "Your resume content...",
    "selectedRole": "Backend Developer"
  }'
```

### Get Recommendations
```bash
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "Your resume content...",
    "selectedRole": "Backend Developer"
  }'
```

---

## Status Check

✅ **ML Service**: Running on port 8000
✅ **Root Endpoint**: Fixed (returns JSON with endpoints list)
✅ **API Documentation**: Available at /docs
⏳ **Backend**: Ready to start (requires npm install if first time)
⏳ **Frontend**: Ready to start (requires npm install if first time)
⏳ **MongoDB**: Optional (backend will continue without DB)

---

## Troubleshooting

### "Module not found" error for ML service
**Fix**: Ensure PYTHONPATH is set correctly
```powershell
$env:PYTHONPATH = "C:\Users\mansi\Documents\GitHub\smart-internship-analyzer\ml-service"
```

### Backend fails to start
**Issue**: MongoDB not running
**Status**: Backend will continue without DB (non-critical)
**Solution**: Install & start MongoDB if needed:
```powershell
# Install MongoDB Community Edition or use Atlas
# Then ensure it's running on localhost:27017
```

### Port already in use
- ML Service (8000): Check `netstat -ano | findstr :8000`
- Backend (5000): Check `netstat -ano | findstr :5000`
- Frontend (5173): Check `netstat -ano | findstr :5173`

---

## Recent Changes
- ✅ Added GET `/` endpoint to ML service API
- ✅ Added complete endpoints documentation
- ✅ Tested RAG system (working correctly)
- ✅ Created comprehensive test suite
