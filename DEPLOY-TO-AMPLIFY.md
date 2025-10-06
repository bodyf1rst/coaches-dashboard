# Deploy Coaches Dashboard to AWS Amplify

## ✅ Pre-Deployment Checklist

All the fixes have been applied:
- [x] PHP API on EC2 properly encodes video URLs (spaces → %20)
- [x] Angular code removes broken API calls
- [x] Thumbnail fallback system implemented
- [x] S3 CORS allows all origins (*)
- [x] Production environment points to EC2 API (http://18.205.116.101)

## 🚀 Deployment Steps

### Step 1: Commit Your Changes

```bash
cd ~/Documents/Bodyf1rst-GitHub-Workspace/coaches-dashboard

# Check what files changed
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Fix video playback, thumbnails, and transcriptions - ready for Amplify"

# Push to GitHub
git push origin main
```

### Step 2: Deploy to Amplify

Amplify should auto-deploy when you push to GitHub. If not:

1. Go to AWS Amplify Console
2. Find your coaches-dashboard app
3. Click "Run build" or wait for auto-deployment
4. Monitor the build (takes 3-4 minutes)

### Step 3: Get Your Amplify URL

Once deployed, your app will be at:
- **Main branch**: `https://main.xxxxx.amplifyapp.com`
- **Or custom domain** if configured

### Step 4: Test Everything

Open your Amplify URL and test:
1. ✅ Navigate to Video Library page
2. ✅ Videos should load with thumbnails
3. ✅ Click on a video - modal opens
4. ✅ Video plays
5. ✅ Transcription displays
6. ✅ No 404 errors in console
7. ✅ No CORS errors in console

## 🔍 Troubleshooting

### If videos don't load:
- Check browser console for errors
- Verify EC2 API is running: http://18.205.116.101/get-videos.php
- Check S3 CORS is still configured (should allow *)

### If thumbnails don't load:
- They're using fallback system - some may show default thumbnail
- CORS is configured to allow all origins
- Check Network tab for actual S3 request failures

### If API calls fail:
- Verify production environment: `apiUrl: 'http://18.205.116.101'`
- Check EC2 instance is running
- Test direct API call: `curl http://18.205.116.101/get-videos.php`

## 📋 What's Different from Local Dev

| Local Dev | Amplify |
|-----------|---------|
| Port changes constantly | Stable URL |
| Server crashes | Always running |
| localhost CORS issues | Proper CORS |
| Fast changes (instant) | Slower (3-4 min builds) |
| Hard to share | Everyone can access |

## 🎯 Next Steps After Successful Deployment

1. Share Amplify URL with team for testing
2. Consider configuring custom domain
3. Set up Amplify monitoring/alerts
4. Plan production deployment strategy

## ⚡ Quick Commands

```bash
# Deploy to Amplify
git add . && git commit -m "Update" && git push origin main

# Check what will be deployed
git status
git diff

# Revert if needed
git log  # find commit hash
git revert <hash>
git push origin main
```

---

**Ready to deploy? Run the commands in Step 1 above!**
