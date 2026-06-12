# Smart Internship Analyzer Backend

## Install

```bash
cd backend
npm install
```

Required packages:

```bash
npm install express mongoose dotenv bcrypt jsonwebtoken multer axios cors helmet morgan joi
npm install -D nodemon
```

## Architecture

- Controllers stay thin and only translate HTTP to services.
- Services hold business logic.
- Repositories isolate MongoDB operations.
- Middleware handles auth, upload, validation, logging, and errors.
- AI clients are wrapped behind service abstractions.

## Request Flow

```text
Route -> Validation -> Auth Middleware -> Controller -> Service -> Repository -> Database
                                         -> AI service abstraction -> Integration client
```

## Sample Responses

```json
{
  "statusCode": 200,
  "message": "Logged in successfully",
  "data": {
    "user": { "id": "..." },
    "token": "..."
  }
}
```

## Testing Strategy

- Unit test services with mocked repositories.
- Integration test routes with a test MongoDB.
- Verify upload, auth, validation, and error responses.
