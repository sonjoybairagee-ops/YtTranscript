# YouTube Transcript Generator

A modern, fast, and clean web application that allows you to easily fetch, translate, and summarize YouTube video transcripts.

## Features Design
- **Dark Theme UI** with a premium Glassmorphism effect.
- **Copy & Download** actions available instantly.
- **AI Integration**: Translate to Bangla or Generate an SEO-friendly summary in seconds using Google Gemini.

## Requirements Documented
- No CSS frameworks; everything is raw HTML/CSS/Vanilla JS for high performance.
- Proxied through Netlify serverless functions (`/.netlify/functions/getTranscript`) to bypass browser CORS errors safely.

## Deployment on Netlify

This project is tailored for **Netlify** because it uses Netlify Functions for the backend layer.

1. **Push to GitHub**: Push this repository to GitHub.
2. **Connect to Netlify**: Go to your Netlify dashboard and select "Add New Site" -> "Import an existing project" and authorize GitHub.
3. **Configure Build**:
   - Build Command: `npm install` (so Netlify installs the function dependencies)
   - Publish Directory: `.` (the root directory where `index.html` sits)
4. **Environment Variables**:
   Go to Site settings > Environment variables and add:
   - Key: `GEMINI_API_KEY`
   - Value: `[YOUR_GOOGLE_GEMINI_API_KEY]`
5. **Deploy!** Netlify will automatically detect the `netlify/functions` folder and deploy them as `/api/...`.

## Local Development
To run this project locally, you must use the Netlify CLI to simulate the serverless functions.
```bash
npm install -g netlify-cli
npm install
netlify dev
```
Make sure you create a `.env` file in the root directory for local dev:
```env
GEMINI_API_KEY=your_key_here
```
