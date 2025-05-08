const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (commented out until we have a MongoDB URI)
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('MongoDB connection error:', err));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MemoMentor API' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/meetings', require('./routes/meetings'));

// API route for transcription
app.post('/api/transcribe', async (req, res) => {
  try {
    const transcriptionService = require('./services/transcription');
    const { audioBuffer } = req.body;

    if (!audioBuffer) {
      return res.status(400).json({ message: 'Audio data is required' });
    }

    const transcript = await transcriptionService.transcribeAudio(audioBuffer);
    res.json({ transcript });
  } catch (error) {
    console.error('Transcription API error:', error);
    res.status(500).json({ message: 'Transcription failed' });
  }
});

// API route for meeting analysis
app.post('/api/analyze', async (req, res) => {
  try {
    const analysisService = require('./services/analysis');
    const { transcript, meetingType, userPreferences } = req.body;

    if (!transcript) {
      return res.status(400).json({ message: 'Transcript is required' });
    }

    const analysis = await analysisService.analyzeMeeting(
      transcript,
      meetingType || 'general',
      userPreferences
    );

    res.json(analysis);
  } catch (error) {
    console.error('Analysis API error:', error);
    res.status(500).json({ message: 'Analysis failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
