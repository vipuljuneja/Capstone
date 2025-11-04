
This report documents the implementation of authentication and API security requirements for our application. We have successfully implemented:

1. **Frontend authentication using OAuth2 with Firebase** (well-known identity provider)
2. **API protection using JWT tokens** (Firebase ID Tokens)

All implementations follow industry best practices and match the provided sequence diagram requirements.

---

## Part 1: Authentication Implementation 

### Requirement

> "Choose one of the following approach: Frontend authentication using OAuth2 with a well known identity provider (Firebase/Google sign-in SDK, Azure identity, etc.) OR Authenticate against your own API (you store your own user id and passwords). You will need to ensure that passwords are properly encrypted."

### Our Approach: OAuth2 with Firebase

We selected **Approach 1** - using Firebase Authentication as our OAuth2 identity provider. This choice provides several advantages:
- Industry-standard security practices
- No need to manage password storage ourselves
- Robust authentication features out of the box
- Integration with Google's infrastructure

---

### Implementation Details

#### 1. Firebase Configuration

**File:** `src/firebase.ts`

```typescript
import { getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { app, auth };
```

**Explanation:** 
- We initialize Firebase Authentication with proper configuration
- We use AsyncStorage for token persistence in React Native
- The `auth` object is exported and used throughout the application

---

#### 2. User Signup Implementation

**File:** `src/screens/auth/SignupScreen.tsx`

```typescript
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';

const handleSignup = async () => {
  try {
    // Firebase handles password encryption automatically
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    
    // User is automatically authenticated after signup
    const user = userCredential.user;
    
    // Create user profile in our MongoDB database
    await createUserInBackend({
      authUid: user.uid,
      email: user.email!,
      name: name.trim(),
    });
    
    console.log('✅ Signup successful');
  } catch (err: any) {
    console.error('❌ Signup error:', err);
    const message = getAuthErrorMessage(err);
    setError(message);
  }
};
```

**Explanation:**
- We use Firebase's `createUserWithEmailAndPassword()` function
- **Critical Point:** Firebase automatically handles password encryption, hashing, and secure storage
- We do NOT store passwords in our own database - Firebase handles all password security
- After successful signup, we create a user profile in our MongoDB database (for application data, not authentication)

---

#### 3. User Login Implementation

**File:** `src/screens/auth/LoginScreen.tsx`

```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';

const handleLogin = async () => {
  try {
    console.log('🔐 Signing in...');
    
    // Firebase verifies credentials and returns authenticated user
    await signInWithEmailAndPassword(auth, email.trim(), password);
    
    console.log('✅ Login successful');
    // Navigation will be handled by AuthContext automatically
  } catch (err: any) {
    console.error('❌ Login error:', err);
    const message = getAuthErrorMessage(err);
    setError(message);
  }
};
```

**Explanation:**
- We use Firebase's `signInWithEmailAndPassword()` function
- Firebase validates credentials against their secure backend
- Upon successful authentication, Firebase automatically issues an ID Token (JWT)
- The token is stored securely by Firebase SDK

---

#### 4. Authentication State Management

**File:** `src/contexts/AuthContext.tsx`

```typescript
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async nextUser => {
      console.log(
        '🔐 Auth state changed:',
        nextUser ? nextUser.email : 'Signed out',
      );
      setUser(nextUser);
      
      if (nextUser) {
        // User signed in - fetch their MongoDB profile
        await fetchMongoUser(nextUser);
      } else {
        // User signed out
        setMongoUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, mongoUser, refreshMongoUser }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Explanation:**
- We use Firebase's `onAuthStateChanged` listener to track authentication state
- This automatically handles token refresh and session management
- When user logs in, Firebase automatically manages their session and token

---

### Security Benefits of Our Approach

1. **Password Security:**
   - ✅ Passwords are NEVER stored in our database
   - ✅ Firebase uses industry-standard bcrypt hashing
   - ✅ Firebase handles all password reset flows securely
   - ✅ We never see or handle plaintext passwords

2. **OAuth2 Compliance:**
   - ✅ Firebase implements OAuth2 standards
   - ✅ Secure token issuance and management
   - ✅ Automatic token refresh

3. **No Password Management:**
   - ✅ We don't need to implement password encryption
   - ✅ We don't need to manage password complexity rules
   - ✅ We don't need to handle password reset logic
   - ✅ All security burden is handled by Firebase (Google)

---

## Part 2: API Security Implementation 

### Requirement

> "Doesn't matter which option the frontend uses, the API must be protected using JWT."

### Our Implementation: Firebase ID Tokens (JWT)

We protect all API endpoints using Firebase ID Tokens, which are JWTs issued by Firebase. Our implementation follows the exact sequence diagram provided in the instructions.

---

### Implementation Flow (Matching Sequence Diagram)

#### Step 1: Login → Token Issuance

**Frontend:** `src/screens/auth/LoginScreen.tsx`

When user logs in via Firebase:
```typescript
await signInWithEmailAndPassword(auth, email.trim(), password);
```

Firebase automatically:
- Validates credentials
- Issues a Firebase ID Token (JWT)
- Stores the token securely

**Token Structure:** Firebase ID Tokens are JWTs containing:
- User ID (uid)
- Email
- Issuance timestamp
- Expiration timestamp
- Signature verified by Firebase

---

#### Step 2: Token Storage

Firebase SDK automatically handles token storage:
- Token is stored securely in AsyncStorage
- Token is automatically refreshed when needed
- Token is managed by Firebase SDK

---

#### Step 3: API Calls with Token

**File:** `src/services/api.ts`

```typescript
import axios, { AxiosError } from 'axios';
import { auth } from '../firebase';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Add request interceptor to attach Firebase auth token
apiClient.interceptors.request.use(
  async config => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Get token (Firebase auto-refreshes if expired)
        const token = await user.getIdToken();
        
        // Attach token to Authorization header
        // Format: "Bearer <token>" - exactly as shown in sequence diagram
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // User not logged in - remove any existing auth header
        delete config.headers.Authorization;
      }
    } catch (error) {
      console.error('❌ Failed to get auth token:', error);
      delete config.headers.Authorization;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);
```

**Explanation:**
- **Every API request** automatically includes the token in the `Authorization` header
- Format matches the sequence diagram: `Authorization: Bearer ${Token}`
- Firebase automatically refreshes expired tokens
- If user is not logged in, no token is sent (for public endpoints)

**Example API Call:**
```typescript
// This automatically includes the token
export const getUserByAuthUid = async (authUid: string) => {
  const response = await apiClient.get(`/users/${authUid}`);
  // Headers automatically include: Authorization: Bearer <token>
  return response.data;
};
```

---

#### Step 4: Backend Token Validation

**File:** `backend/src/middleware/authMiddleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { firebaseAdmin } from '../config/firebase';
import { User } from '../models';

/**
 * Middleware to verify Firebase JWT token
 * This implements the "Token valid?" check from the sequence diagram
 */
export const verifyFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Step 1: Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'No authorization token provided'
      });
      return;
    }

    // Step 2: Extract token from "Bearer <token>" format
    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token format'
      });
      return;
    }

    // Step 3: Verify token with Firebase Admin SDK
    // This is equivalent to "Backend Api" asking "Auth Provider" if token is valid
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);

    // Step 4: Find user in MongoDB by Firebase UID
    const user = await User.findOne({ authUid: decodedToken.uid });

    // Step 5: Attach user info to request for use in route handlers
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      userId: user?._id ? (user._id as Types.ObjectId).toString() : undefined
    };

    // Step 6: Token is valid - proceed to route handler
    next();
  } catch (error: any) {
    console.error('❌ Auth error:', error);

    // Handle specific error cases
    if (error.code === 'auth/id-token-expired') {
      res.status(401).json({
        status: 'error',
        message: 'Token expired. Please login again.'
      });
      return;
    }

    if (error.code === 'auth/argument-error') {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
      return;
    }

    // Generic authentication failure
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};
```

**Explanation:**
- **Token Extraction:** We extract the token from the `Authorization: Bearer <token>` header
- **Token Verification:** We use Firebase Admin SDK's `verifyIdToken()` method
  - This checks if the token is valid
  - This checks if the token is expired
  - This checks if the token was issued by Firebase
  - This is the "Token valid?" check from the sequence diagram
- **User Lookup:** We find the corresponding user in our MongoDB database
- **Request Enhancement:** We attach user info to `req.user` for route handlers
- **Error Handling:** We return appropriate 401 errors for invalid/expired tokens

---

#### Step 5: Protected Routes

**File:** `backend/src/routes/routes.ts`

```typescript
import { verifyFirebaseToken, verifyUserOwnership } from '../middleware/authMiddleware';

// All protected routes use verifyFirebaseToken middleware
router.get('/users/:authUid', verifyFirebaseToken, verifyUserOwnership, controllers.getUserByAuthUid);
router.put('/users/:authUid', verifyFirebaseToken, verifyUserOwnership, controllers.updateUserProfile);
router.post('/practice-sessions', verifyFirebaseToken, controllers.startPracticeSession);
router.get('/reflections/user/:userId', verifyFirebaseToken, controllers.getReflectionsByUser);
// ... all other routes protected similarly

// Only signup endpoint is public (intentionally)
router.post('/users', controllers.createUser); // Public - no auth required
```

**Explanation:**
- All routes that need authentication use `verifyFirebaseToken` middleware
- If token is invalid or missing, request is rejected with 401
- If token is valid, request proceeds to the controller
- Only `POST /api/users` (signup) is intentionally public

---

#### Step 6: API Response

**After Token Validation:**

If token is **valid:**
- Request proceeds to route handler
- API processes the request
- Returns `HTTP 200 OK` with data

If token is **invalid/expired:**
- Request is rejected
- Returns `HTTP 401 Unauthorized` with error message
- Client can handle the error (e.g., redirect to login)

---

### Complete Request Flow Example

Let's trace a complete request from frontend to backend:

**1. User makes API call:**
```typescript
// Frontend: src/services/api.ts
const response = await apiClient.get('/users/abc123');
```

**2. Request interceptor adds token:**
```typescript
// Automatically adds: Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
config.headers.Authorization = `Bearer ${token}`;
```

**3. Request sent to backend:**
```
GET /api/users/abc123
Headers:
  Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

**4. Backend middleware validates:**
```typescript
// backend/src/middleware/authMiddleware.ts
const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
// ✅ Token is valid
// ✅ User info attached to req.user
```

**5. Route handler processes:**
```typescript
// backend/src/controllers/userController.ts
export const getUserByAuthUid = async (req: Request, res: Response) => {
  // req.user is available here (from middleware)
  const user = await User.findOne({ authUid: req.user.uid });
  res.json({ success: true, data: user });
};
```

**6. Response sent:**
```
HTTP 200 OK
{
  "success": true,
  "data": { ...user data... }
}
```

---

### Additional Security Features

#### 1. Automatic Token Refresh

**File:** `src/services/api.ts`

```typescript
// Add response interceptor to handle 401 errors (token expired)
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If we get 401 and haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const user = auth.currentUser;
        if (user) {
          // Force refresh token
          const newToken = await user.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          // Retry the original request with new token
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Failed to refresh token:', refreshError);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
```

**Explanation:**
- If we receive a 401 error, we automatically refresh the token
- We retry the original request with the new token
- This improves user experience (no need to manually login again)

---

#### 2. User Ownership Verification

**File:** `backend/src/middleware/authMiddleware.ts`

```typescript
/**
 * Middleware to verify that the authenticated user matches the :authUid parameter
 * Prevents users from accessing other users' resources
 */
export const verifyUserOwnership = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
    return;
  }

  const { authUid } = req.params;
  
  // Ensure user can only access their own resources
  if (authUid && req.user.uid !== authUid) {
    res.status(403).json({
      status: 'error',
      message: 'Forbidden: You can only access your own resources'
    });
    return;
  }

  next();
};
```

**Usage:**
```typescript
// User can only access their own profile
router.get('/users/:authUid', 
  verifyFirebaseToken,      // First verify token
  verifyUserOwnership,      // Then verify ownership
  controllers.getUserByAuthUid
);
```

**Explanation:**
- Additional security layer beyond token validation
- Ensures users can only access their own data
- Prevents unauthorized access even with valid token

---

## Summary: Compliance with Requirements

###  Authentication 

| Requirement | Status | Implementation |
|------------|--------|----------------|
| OAuth2 with well-known provider | ✅ | Firebase Authentication |
| Password encryption | ✅ | Handled by Firebase (not stored in our DB) |
| No password storage in our system | ✅ | Firebase manages all password security |


- Using `signInWithEmailAndPassword()` and `createUserWithEmailAndPassword()`
- No password storage in MongoDB
- Firebase handles all password security

---

### API Security  

| Requirement | Status | Implementation |
|------------|--------|----------------|
| API protected with JWT | ✅ | Firebase ID Tokens (JWTs) |
| Token in Authorization header | ✅ | `Authorization: Bearer <token>` |
| Backend token validation | ✅ | Firebase Admin SDK `verifyIdToken()` |
| All routes protected | ✅ | `verifyFirebaseToken` middleware |


- Frontend sends token in every request: `Authorization: Bearer ${token}`
- Backend validates token: `firebaseAdmin.auth().verifyIdToken(token)`
- All protected routes use `verifyFirebaseToken` middleware
- Matches sequence diagram flow exactly

---

## Code Files Reference

### Frontend Files:
- `src/firebase.ts` - Firebase initialization
- `src/services/api.ts` - API client with token interceptor
- `src/screens/auth/LoginScreen.tsx` - Login implementation
- `src/screens/auth/SignupScreen.tsx` - Signup implementation
- `src/contexts/AuthContext.tsx` - Authentication state management

### Backend Files:
- `backend/src/middleware/authMiddleware.ts` - Token verification middleware
- `backend/src/routes/routes.ts` - Protected routes
- `backend/src/config/firebase.ts` - Firebase Admin SDK configuration

---





1. **Authentication :** We use Firebase OAuth2 authentication. Passwords are encrypted and secured by Firebase - we never store or handle passwords in our system.

2. **API Security :** All API endpoints are protected using Firebase ID Tokens (JWTs). The implementation follows the provided sequence diagram exactly:
   - Login → Token issuance
   - Token storage
   - API calls with `Authorization: Bearer <token>`
   - Backend token validation
   - API response

