@echo off
echo Starting MediSense AI...
echo Please set your GROQ_API_KEY first!
set /p GROQ_API_KEY="Enter your Groq API Key: "
cd backend
python app.py