# Coaches Dashboard Local API

This is the local Node.js API server for the Coaches Dashboard video library.

## Setup Instructions

### 1. Update Database Password

Edit the `.env` file and replace `your_password_here` with your actual RDS database password:

```env
DB_HOST=bodyf1rst-db.c4rsccauwjin.us-east-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=YOUR_ACTUAL_PASSWORD_HERE
DB_NAME=bodyf1rst
PORT=3001
```

### 2. Install Dependencies

From the `coaches-dashboard/local-api` directory, run:

```bash
npm install
```

This will install:
- express (^4.18.2)
- cors (^2.8.5)
- mysql2 (^3.15.1)
- dotenv (^17.2.3)

### 3. Start the API Server

```bash
npm start
```

The server will start on port 3001 (http://localhost:3001)

### 4. Start the Angular Dashboard

In a separate terminal, from the `coaches-dashboard` directory:

```bash
npm start
```

The dashboard will run on port 59087 and connect to the API on port 3001.

## API Endpoints

### GET /api/get-videos

Returns all videos with complete data including:
- `video_id`: Unique identifier
- `video_title`: Video title
- `video_url`: S3 URL for video playback
- `thumbnailUrl`: S3 URL for thumbnail image
- `transcription`: Video transcription text
- `category`: Video category
- `tags`: Comma-separated tags
- `duration`: Video duration

## Database Schema

The API connects to the RDS MySQL database at:
- Host: bodyf1rst-db.c4rsccauwjin.us-east-1.rds.amazonaws.com
- Database: bodyf1rst
- Table: videos

## Troubleshooting

### Database Connection Issues

If you get database connection errors:
1. Verify the password in `.env` is correct
2. Check RDS security group allows your IP address
3. Verify the RDS instance is running

### Port Already in Use

If port 3001 is already in use:
1. Change the PORT value in `.env`
2. Update `environment.ts` in the Angular app to match

### CORS Errors

The server is configured with CORS enabled for all origins. If you still see CORS errors, check that the Angular app's `environment.ts` has the correct API URL: `http://localhost:3001`
