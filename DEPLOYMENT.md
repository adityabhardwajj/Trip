# Vercel Deployment Guide

This guide will help you deploy your Trip Booking Platform to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. A MongoDB Atlas account (for the database)
3. GitHub repository (already set up)

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use `0.0.0.0/0` for all IPs)
5. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (select your account)
   - Link to existing project? **No**
   - Project name? (use default or choose one)
   - Directory? **./** (current directory)
   - Override settings? **No**

5. Set environment variables:
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   ```
   - Enter your MongoDB connection string for `MONGODB_URI`
   - Enter a secret key for `JWT_SECRET` (can be any random string)

6. Redeploy with environment variables:
   ```bash
   vercel --prod
   ```

### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: (leave empty, will use package.json)

5. Add Environment Variables:
   - Go to Project Settings → Environment Variables
   - Add the following:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A secret key for JWT tokens (any random string)
     - `NODE_ENV`: `production`

6. Click "Deploy"

## Step 3: Verify Deployment

1. After deployment, Vercel will provide you with a URL (e.g., `https://your-project.vercel.app`)
2. Test the API:
   - Visit: `https://your-project.vercel.app/api/health`
   - You should see: `{"status":"OK","message":"Server is running"}`
3. Test the frontend:
   - Visit: `https://your-project.vercel.app`
   - The app should load

## Troubleshooting

### Common Issues:

1. **Build fails**: 
   - Check that all dependencies are listed in `package.json`
   - Ensure Node.js version is compatible (Vercel uses Node 18.x by default)

2. **API routes not working**:
   - Verify `vercel.json` is in the root directory
   - Check that `api/index.js` exists
   - Ensure environment variables are set correctly

3. **MongoDB connection errors**:
   - Verify `MONGODB_URI` is set correctly in Vercel environment variables
   - Check MongoDB Atlas IP whitelist includes Vercel IPs (or use `0.0.0.0/0`)
   - Ensure database user has proper permissions

4. **Frontend can't reach API**:
   - The API base URL is already set to `/api` which should work
   - Check browser console for CORS errors
   - Verify API routes are working with `/api/health`

### Environment Variables Required:

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `NODE_ENV`: Set to `production` (optional but recommended)

## Project Structure

```
├── api/
│   ├── index.js          # Serverless function entry point
│   └── package.json      # API dependencies
├── backend/              # Backend source code
├── frontend/             # Frontend source code
├── vercel.json          # Vercel configuration
└── package.json         # Root package.json
```

## Notes

- The backend Express app is wrapped as a Vercel serverless function in `api/index.js`
- All `/api/*` routes are handled by the serverless function
- Frontend is built and served as static files
- MongoDB connection is optimized for serverless (with connection pooling)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas logs
3. Verify environment variables are set correctly
4. Test API endpoints directly using the health check endpoint

