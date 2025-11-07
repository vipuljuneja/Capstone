# Video Storage Testing Guide

## Prerequisites

### 1. Environment Variables Setup

Make sure your `backend/.env` file has these variables:

```env
# D-ID API Key (required for video generation)
DID_API_KEY=your_did_api_key_here
# OR
AVATAR_API_KEY=your_did_api_key_here

# Supabase Configuration (required for video storage)
SUPABASE_URL=https://tiapdsojkbqjucmjmjri.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Optional: Custom avatar image
AVATAR_IMAGE_URL=https://create-images-results.d-id.com/api_docs/assets/noelle.jpeg

# OpenAI API Key (required for question generation)
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Supabase Storage Setup

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to **Storage** → **Buckets**
3. Ensure the `capstone` bucket exists
4. Make sure the bucket is **public** (or has proper RLS policies)
5. Verify you have the **Service Role Key** (not the anon key) - this has admin access

## Testing Steps

### Step 1: Complete a Level 1 Session

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Complete a Level 1 practice session through your app or API:
   - Use the endpoint: `POST /api/practice-sessions/complete`
   - This should trigger question generation for Level 2

3. **Watch the backend console logs** - you should see:
   ```
   💾 Saved personalized next-level questions
   🎬 Starting background video generation and storage...
   ```

### Step 2: Monitor Background Process

Watch the backend logs for these messages:

**Success indicators:**
```
🎬 Starting background video generation and storage...
🎬 Generating video for question 1: "Question text..."
📥 Downloading video from D-ID...
☁️ Uploading to Supabase: avatar-videos/{userId}/{scenarioId}/2/{filename}.mp4
✅ Video stored successfully: https://...
✅ Successfully updated questions with Supabase video URLs
```

**Error indicators:**
```
❌ DID_API_KEY not configured. Skipping video generation.
❌ Supabase not configured. Skipping video upload.
❌ Failed to generate video for question X: [error message]
❌ Background video generation/storage failed: [error message]
```

### Step 3: Check MongoDB Database

1. Connect to your MongoDB database
2. Query the `userscenariooverrides` collection:

```javascript
// In MongoDB shell or Compass
db.userscenariooverrides.findOne({
  userId: ObjectId("your_user_id"),
  scenarioId: ObjectId("your_scenario_id")
})
```

**What to look for:**
- `level2.questions[].videoUrl` should contain Supabase URLs (not placeholder URLs)
- URLs should start with: `https://tiapdsojkbqjucmjmjri.supabase.co/storage/v1/object/public/capstone/...`
- If you see placeholder URLs like `coffee_level2_q1.mp4`, videos haven't been generated yet

### Step 4: Check Supabase Storage

1. Go to Supabase Dashboard → **Storage** → **Buckets** → **capstone**
2. Navigate to: `avatar-videos/{userId}/{scenarioId}/{level}/`
3. You should see `.mp4` files named like:
   - `{userId}_{scenarioId}_level2_1.mp4`
   - `{userId}_{scenarioId}_level2_2.mp4`
   - etc.

4. Click on a file to verify:
   - File size should be > 0 (videos are typically a few MB)
   - You can download/preview it

### Step 5: Test Video URLs

1. Get the video URL from MongoDB or Supabase
2. Test in browser or curl:
   ```bash
   curl -I "https://tiapdsojkbqjucmjmjri.supabase.co/storage/v1/object/public/capstone/avatar-videos/..."
   ```
   Should return `200 OK`

3. Or open the URL directly in a browser - video should play

### Step 6: Verify Frontend Integration

1. Navigate to Level 2 in your app
2. The `AvatarGenerator` component should:
   - Fetch questions from `/api/users/{userId}/scenarios/{scenarioId}/levels/level2/questions`
   - Receive questions with Supabase video URLs
   - Play videos from Supabase (not D-ID directly)

## Quick Test Script

You can also test the video storage service directly:

```typescript
// Create a test file: backend/test-video-storage.ts
import { generateAndStoreVideos } from './src/services/videoStorageService';

const testQuestions = [
  { order: 1, text: "Hello, how can I help you today?", videoUrl: "test_1.mp4" },
  { order: 2, text: "What would you like to order?", videoUrl: "test_2.mp4" }
];

async function test() {
  console.log('Testing video generation and storage...');
  const result = await generateAndStoreVideos(
    testQuestions,
    '507f1f77bcf86cd799439011', // Test userId
    '507f191e810c19729de860ea', // Test scenarioId
    2 // Level 2
  );
  console.log('Result:', result);
}

test().catch(console.error);
```

Run with:
```bash
npx ts-node backend/test-video-storage.ts
```

## Troubleshooting

### Issue: "DID_API_KEY not configured"
- **Solution**: Add `DID_API_KEY` or `AVATAR_API_KEY` to `.env`
- **Check**: Restart backend server after adding env vars

### Issue: "Supabase not configured"
- **Solution**: Add `SUPABASE_SERVICE_ROLE_KEY` to `.env`
- **Note**: Use Service Role Key (not anon key) for admin access

### Issue: Videos not appearing in Supabase
- **Check**: Bucket permissions - ensure `capstone` bucket exists and is accessible
- **Check**: Storage path - verify the path structure matches: `avatar-videos/{userId}/{scenarioId}/{level}/`

### Issue: Videos generated but URLs not updated in DB
- **Check**: Backend logs for errors in the background process
- **Check**: MongoDB connection is working
- **Note**: Background process runs asynchronously - wait a few minutes for completion

### Issue: "Timed out waiting for video"
- **Cause**: D-ID API is slow or rate-limited
- **Solution**: The timeout is 4 minutes (120 tries × 2 seconds). If this happens frequently, consider:
  - Checking D-ID API status
  - Verifying API key is valid
  - Checking if you've hit rate limits

### Issue: Videos are placeholder URLs
- **Cause**: Video generation failed but questions were saved
- **Solution**: Check backend logs for specific error messages
- **Note**: The system keeps placeholder URLs if generation fails (graceful degradation)

## Expected Timeline

- **Question Generation**: ~2-5 seconds (OpenAI API)
- **Video Generation**: ~30-120 seconds per video (D-ID API)
- **Download & Upload**: ~5-10 seconds per video
- **Total for 3-4 questions**: ~2-5 minutes (runs in background)

## Monitoring

Watch these logs in order:
1. `💾 Saved personalized next-level questions` - Questions saved
2. `🎬 Starting background video generation...` - Process started
3. `🎬 Generating video for question X` - Each video generation
4. `✅ Video stored successfully` - Each video completed
5. `✅ Successfully updated questions with Supabase video URLs` - All done

## Success Criteria

✅ Videos appear in Supabase Storage  
✅ MongoDB `UserScenarioOverrides` has Supabase URLs (not placeholders)  
✅ Video URLs are accessible (return 200 OK)  
✅ Frontend can play videos from Supabase URLs  
✅ No errors in backend logs

