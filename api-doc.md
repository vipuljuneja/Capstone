# Practice in Peace API Documentation

**Base URL:** 
- Development: `http://localhost:3000/api`
- Production: `https://your-production-api.com/api`

**Authentication:** Firebase Bearer Token in Authorization header
```
Authorization: Bearer <firebase_id_token>
```

---

## 📋 Table of Contents
1. [Users](#users)
2. [Assessment Templates](#assessment-templates)
3. [Assessment Responses](#assessment-responses)
4. [Scenarios](#scenarios)
5. [Level Prompts](#level-prompts)
6. [Media Jobs](#media-jobs)
7. [Practice Sessions](#practice-sessions)
8. [Progress](#progress)
9. [Encouragement Notes](#encouragement-notes)
10. [Achievements](#achievements)

---

## 👤 Users

### Create User
**POST** `/users`

Creates a new user in the system after Firebase authentication.

**Request Body:**
```json
{
  "authUid": "firebase_auth_uid",
  "email": "user@example.com",
  "name": "John Doe",
  "profile": {
    "severityLevel": "Moderate",
    "focusHints": []
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "user_mongodb_id",
    "authUid": "firebase_auth_uid",
    "email": "user@example.com",
    "name": "John Doe",
    "profile": {
      "severityLevel": "Moderate",
      "focusHints": []
    },
    "streak": {
      "current": 0,
      "longest": 0,
      "lastActiveAt": null
    },
    "achievements": [],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Get User by Auth UID
**GET** `/users/:authUid`

Retrieves user profile by Firebase authentication UID.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "user_mongodb_id",
    "authUid": "firebase_auth_uid",
    "email": "user@example.com",
    "name": "John Doe",
    "profile": {
      "severityLevel": "Moderate",
      "focusHints": ["public_speaking", "interviews"]
    },
    "streak": {
      "current": 5,
      "longest": 12,
      "lastActiveAt": "2024-01-15T08:00:00Z"
    },
    "achievements": ["first_session", "week_streak"]
  }
}
```

---

### Update User Profile
**PUT** `/users/:authUid`

Updates user name and profile settings.

**Request Body:**
```json
{
  "name": "John Smith",
  "profile": {
    "severityLevel": "Mild",
    "focusHints": ["presentations", "networking"]
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "user_mongodb_id",
    "authUid": "firebase_auth_uid",
    "name": "John Smith",
    "profile": {
      "severityLevel": "Mild",
      "focusHints": ["presentations", "networking"]
    }
  }
}
```

---

### Update User Streak
**PUT** `/users/:authUid/streak`

Updates user's daily practice streak. Automatically increments if user completes a session on consecutive days.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "current": 6,
    "longest": 12,
    "lastActiveAt": "2024-01-16T09:15:00Z"
  }
}
```

---

### Add Achievement to User
**POST** `/users/:authUid/achievements`

Adds an achievement to user's profile.

**Request Body:**
```json
{
  "achievementKey": "five_sessions"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": ["first_session", "week_streak", "five_sessions"]
}
```

---

### Delete User
**DELETE** `/users/:authUid`

Deletes user and all associated data (cascades to assessment responses, practice sessions, progress, encouragement notes).

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User and related data deleted"
}
```

---

## 📝 Assessment Templates

### Create Assessment Template
**POST** `/assessment-templates`

Creates a new assessment template (e.g., for anxiety questionnaires).

**Request Body:**
```json
{
  "title": "Social Anxiety Inventory",
  "scale": {
    "min": 0,
    "max": 4,
    "labels": ["Not at all", "Slightly", "Moderately", "Very", "Extremely"]
  },
  "items": [
    {
      "key": "q1",
      "text": "I feel anxious when speaking in public",
      "category": "public_speaking"
    },
    {
      "key": "q2",
      "text": "I avoid social gatherings",
      "category": "social_situations"
    }
  ]
}
```

**Response:** `201 Created`

---

### Get All Assessment Templates
**GET** `/assessment-templates`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "template_id",
      "title": "Social Anxiety Inventory",
      "scale": { "min": 0, "max": 4 },
      "items": [...]
    }
  ]
}
```

---

### Get Assessment Template by ID
**GET** `/assessment-templates/:id`

---

### Update Assessment Template
**PUT** `/assessment-templates/:id`

---

### Delete Assessment Template
**DELETE** `/assessment-templates/:id`

---

## 📊 Assessment Responses

### Submit Assessment Response
**POST** `/assessment-responses`

Submits user's answers to an assessment and updates their profile.

**Request Body:**
```json
{
  "userId": "user_mongodb_id",
  "templateId": "template_mongodb_id",
  "responses": {
    "q1": 3,
    "q2": 2,
    "q3": 4
  },
  "derived": {
    "totalScore": 45,
    "severityLevel": "Moderate",
    "recommendedTracks": ["public_speaking", "interviews"]
  },
  "notes": "Completed after onboarding"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "response_id",
    "userId": "user_mongodb_id",
    "templateId": "template_mongodb_id",
    "responses": { "q1": 3, "q2": 2, "q3": 4 },
    "derived": {
      "totalScore": 45,
      "severityLevel": "Moderate",
      "recommendedTracks": ["public_speaking", "interviews"]
    },
    "completedAt": "2024-01-15T10:45:00Z"
  }
}
```

---

### Get User Assessment Responses
**GET** `/assessment-responses/user/:userId`

Retrieves all assessment responses for a user, sorted by completion date (newest first).

**Response:** `200 OK`

---

### Get Latest Assessment Response
**GET** `/assessment-responses/user/:userId/latest`

Gets the most recent assessment response for a user.

**Response:** `200 OK`

---

## 🎬 Scenarios

### Create Scenario
**POST** `/scenarios`

Creates a new practice scenario.

**Request Body:**
```json
{
  "title": "Job Interview",
  "description": "Practice answering common interview questions",
  "category": "professional",
  "difficulty": "intermediate",
  "estimatedDuration": 15,
  "previewImageUrl": "https://example.com/images/interview.jpg",
  "tags": ["career", "interviews", "professional"],
  "status": "published"
}
```

**Response:** `201 Created`

---

### Get All Scenarios
**GET** `/scenarios`

Query Parameters:
- `status` (optional): Filter by status ("draft" or "published")

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "scenario_id",
      "title": "Job Interview",
      "description": "Practice answering common interview questions",
      "category": "professional",
      "difficulty": "intermediate",
      "estimatedDuration": 15,
      "status": "published",
      "tags": ["career", "interviews"]
    }
  ]
}
```

---

### Get Published Scenarios Only
**GET** `/scenarios/published`

Returns only scenarios with status "published".

---

### Get Scenario by ID
**GET** `/scenarios/:id`

---

### Update Scenario
**PUT** `/scenarios/:id`

---

### Delete Scenario
**DELETE** `/scenarios/:id`

Deletes scenario and cascades to related level prompts, media jobs, practice sessions, and progress records.

---

## 🎯 Level Prompts

### Create Level Prompt
**POST** `/level-prompts`

Creates prompts and rubrics for a specific difficulty level within a scenario.

**Request Body:**
```json
{
  "scenarioId": "scenario_mongodb_id",
  "level": 1,
  "introScript": "Welcome to your first interview practice session...",
  "questionSet": [
    "Tell me about yourself",
    "Why do you want this job?",
    "What are your strengths?"
  ],
  "rubric": {
    "wpm": { "ideal": 140, "min": 100, "max": 180 },
    "fillersPerMin": { "good": 2, "acceptable": 5 },
    "toneScore": { "min": 0.6 },
    "eyeContactRatio": { "min": 0.5 }
  },
  "aiSystemPrompt": "You are an interview coach...",
  "aiScoringPrompt": "Evaluate the candidate's response based on..."
}
```

**Response:** `201 Created`

---

### Get Level Prompt by Scenario and Level
**GET** `/level-prompts/scenario/:scenarioId/level/:level`

Retrieves the specific level prompt for a scenario.

**Response:** `200 OK`

---

### Get All Level Prompts for Scenario
**GET** `/level-prompts/scenario/:scenarioId`

Returns all levels (1, 2, 3) for a scenario, sorted by level.

---

### Update Level Prompt
**PUT** `/level-prompts/:id`

---

### Delete Level Prompt
**DELETE** `/level-prompts/:id`

---

## 🎥 Media Jobs

### Create Media Job
**POST** `/media-jobs`

Tracks video/avatar generation jobs (e.g., D-ID API).

**Request Body:**
```json
{
  "scenarioId": "scenario_mongodb_id",
  "level": 1,
  "provider": "d-id",
  "jobId": "provider_job_id_123",
  "status": "pending",
  "requestPayload": {
    "script": "Hello, welcome to the interview..."
  },
  "resultUrl": null,
  "errorMessage": null
}
```

**Response:** `201 Created`

---

### Get Media Job by MongoDB ID
**GET** `/media-jobs/:id`

---

### Get Media Job by Provider Job ID
**GET** `/media-jobs/job/:jobId`

---

### Update Media Job Status
**PUT** `/media-jobs/job/:jobId/status`

**Request Body:**
```json
{
  "status": "completed",
  "resultUrl": "https://d-id.com/videos/xyz.mp4",
  "errorMessage": null
}
```

---

### Get Media Jobs by Status
**GET** `/media-jobs/status/:status`

Parameters: `:status` = "pending" | "processing" | "completed" | "failed"

---

### Get Media Jobs for Scenario
**GET** `/media-jobs/scenario/:scenarioId`

---

## 🎤 Practice Sessions

### Start Practice Session
**POST** `/practice-sessions`

Starts a new practice session for a user.

**Request Body:**
```json
{
  "userId": "user_mongodb_id",
  "scenarioId": "scenario_mongodb_id",
  "level": 1
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "session_id",
    "userId": "user_mongodb_id",
    "scenarioId": "scenario_mongodb_id",
    "level": 1,
    "status": "active",
    "steps": [],
    "aggregate": {
      "wpmAvg": 0,
      "fillersPerMin": 0,
      "toneScore": 0,
      "eyeContactRatio": null,
      "score": 0
    },
    "aiFeedbackCards": [],
    "achievementsUnlocked": [],
    "startedAt": "2024-01-15T11:00:00Z",
    "completedAt": null
  }
}
```

---

### Add Step to Session
**POST** `/practice-sessions/:sessionId/steps`

Adds a completed question/answer step to the active session.

**Request Body:**
```json
{
  "step": {
    "order": 1,
    "startedAt": "2024-01-15T11:01:00Z",
    "endedAt": "2024-01-15T11:02:30Z",
    "transcript": "I am a software engineer with 5 years of experience...",
    "metrics": {
      "durationSec": 90,
      "wpm": 145,
      "fillers": [
        { "word": "um", "t": 15.2 },
        { "word": "like", "t": 42.8 }
      ],
      "pauses": [
        { "t": 30.5, "len": 2.1 }
      ],
      "tone": {
        "score": 0.75,
        "labels": ["confident", "professional"]
      },
      "eyeContact": {
        "available": true,
        "ratio": 0.68
      },
      "smile": {
        "ratio": 0.32
      }
    }
  }
}
```

**Response:** `200 OK`

---

### Complete Session
**PUT** `/practice-sessions/:sessionId/complete`

Marks session as completed and calculates final scores. Automatically updates user progress and unlocks next level if score ≥ 70.

**Request Body:**
```json
{
  "aggregate": {
    "wpmAvg": 142,
    "fillersPerMin": 3.2,
    "toneScore": 0.78,
    "eyeContactRatio": 0.65,
    "score": 82
  },
  "aiFeedbackCards": [
    {
      "title": "Great pace!",
      "body": "Your speaking speed was well-controlled and natural.",
      "type": "praise"
    },
    {
      "title": "Watch filler words",
      "body": "Try to reduce 'um' and 'like' in your responses.",
      "type": "tip"
    }
  ],
  "achievementsUnlocked": ["first_level_complete"]
}
```

**Response:** `200 OK`

---

### Abandon Session
**PUT** `/practice-sessions/:sessionId/abandon`

Marks session as abandoned (user quit early).

**Response:** `200 OK`

---

### Get User Sessions
**GET** `/practice-sessions/user/:userId`

Query Parameters:
- `status` (optional): Filter by "active", "completed", or "abandoned"
- `limit` (optional): Max results to return (default: 50)

**Response:** `200 OK`

---

### Get Session by ID
**GET** `/practice-sessions/:sessionId`

---

### Delete Session
**DELETE** `/practice-sessions/:sessionId`

---

## 📈 Progress

### Initialize Progress
**POST** `/progress`

Creates a progress tracking record for a user-scenario pair.

**Request Body:**
```json
{
  "userId": "user_mongodb_id",
  "scenarioId": "scenario_mongodb_id"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "progress_id",
    "userId": "user_mongodb_id",
    "scenarioId": "scenario_mongodb_id",
    "levels": {
      "1": {
        "attempts": 0,
        "lastCompletedAt": null,
        "achievements": [],
        "unlockedAt": "2024-01-15T11:00:00Z"
      }
    },
    "totalSessions": 0,
    "lastPlayedAt": null
  }
}
```

---

### Get User Progress
**GET** `/progress/user/:userId`

Returns all progress records for a user across all scenarios.

**Response:** `200 OK`

---

### Get Progress for Specific Scenario
**GET** `/progress/user/:userId/scenario/:scenarioId`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "progress_id",
    "userId": "user_mongodb_id",
    "scenarioId": "scenario_mongodb_id",
    "levels": {
      "1": {
        "attempts": 3,
        "lastCompletedAt": "2024-01-15T12:00:00Z",
        "achievements": ["first_level_complete"],
        "unlockedAt": "2024-01-15T11:00:00Z"
      },
      "2": {
        "attempts": 1,
        "lastCompletedAt": "2024-01-16T10:30:00Z",
        "achievements": [],
        "unlockedAt": "2024-01-15T12:00:00Z"
      }
    },
    "totalSessions": 4,
    "lastPlayedAt": "2024-01-16T10:30:00Z"
  }
}
```

---

### Unlock Level Manually
**PUT** `/progress/user/:userId/scenario/:scenarioId/unlock`

Manually unlocks a specific level (admin/debug feature).

**Request Body:**
```json
{
  "level": 2
}
```

**Response:** `200 OK`

---

## 💭 Encouragement Notes

### Create Encouragement Note
**POST** `/encouragement-notes`

Creates a personal note or reflection for the user.

**Request Body:**
```json
{
  "userId": "user_mongodb_id",
  "date": "2024-01-15",
  "title": "Great progress today!",
  "body": "I felt more confident during the interview scenario. My speaking pace improved.",
  "tags": ["confidence", "improvement"],
  "linkedSessionId": "session_mongodb_id"
}
```

**Response:** `201 Created`

---

### Get User Notes
**GET** `/encouragement-notes/user/:userId`

Query Parameters:
- `tags` (optional): Filter by comma-separated tags (e.g., "confidence,improvement")
- `date` (optional): Filter by specific date (YYYY-MM-DD)

**Response:** `200 OK`

---

### Get Note by ID
**GET** `/encouragement-notes/:id`

---

### Update Note
**PUT** `/encouragement-notes/:id`

---

### Delete Note
**DELETE** `/encouragement-notes/:id`

---

## 🏆 Achievements

### Create Achievement
**POST** `/achievements`

Creates a new achievement definition.

**Request Body:**
```json
{
  "key": "ten_sessions",
  "title": "Dedicated Practitioner",
  "description": "Complete 10 practice sessions",
  "icon": "trophy",
  "category": "session"
}
```

**Response:** `201 Created`

---

### Get All Achievements
**GET** `/achievements`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "achievement_id",
      "key": "first_session",
      "title": "Getting Started",
      "description": "Complete your first practice session",
      "icon": "star",
      "category": "session"
    }
  ]
}
```

---

### Get Achievement by ID
**GET** `/achievements/:id`

---

### Get Achievement by Key
**GET** `/achievements/key/:key`

---

### Update Achievement
**PUT** `/achievements/:id`

---

### Delete Achievement
**DELETE** `/achievements/:id`

---

## 🔑 Authentication

All authenticated endpoints require a Firebase ID token in the Authorization header:

```javascript
const token = await firebase.auth().currentUser.getIdToken();

fetch('http://localhost:3000/api/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 📌 Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": { /* result object or array */ }
}
```

### Error Response
```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes
- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## 🔄 Typical User Flow

1. **Onboarding:**
   - Create user: `POST /users`
   - Submit assessment: `POST /assessment-responses`
   - User profile updated with severity level and focus areas

2. **Practice Session:**
   - Get scenarios: `GET /scenarios/published`
   - Get user progress: `GET /progress/user/:userId`
   - Start session: `POST /practice-sessions`
   - Add steps: `POST /practice-sessions/:sessionId/steps`
   - Complete session: `PUT /practice-sessions/:sessionId/complete`
   - Progress automatically updated, next level unlocked if score ≥ 70

3. **Track Progress:**
   - Update streak: `PUT /users/:authUid/streak`
   - Get progress: `GET /progress/user/:userId/scenario/:scenarioId`
   - View achievements: `GET /achievements`

4. **Reflection:**
   - Create note: `POST /encouragement-notes`
   - View notes: `GET /encouragement-notes/user/:userId`

---

## 📱 Client SDK Example

```typescript
import { auth } from './firebase';

const API_BASE_URL = 'http://localhost:3000/api';

const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data;
};

// Usage examples:
const user = await apiRequest('/users/firebase_uid_123');
const scenarios = await apiRequest('/scenarios/published');
const session = await apiRequest('/practice-sessions', {
  method: 'POST',
  body: JSON.stringify({ userId, scenarioId, level: 1 })
});
```

---

**Last Updated:** January 2024  
**API Version:** 1.0.0
