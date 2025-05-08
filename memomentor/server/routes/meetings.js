const express = require('express');
const auth = require('../middleware/auth');
const Meeting = require('../models/Meeting');
const router = express.Router();

// Get all meetings for the current user
router.get('/', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [
        { organizer: req.user.userId },
        { participants: req.user.userId }
      ]
    }).sort({ date: -1 });
    
    res.json(meetings);
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific meeting
router.get('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Check if user is authorized to view this meeting
    if (
      meeting.organizer.toString() !== req.user.userId &&
      !meeting.participants.includes(req.user.userId)
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(meeting);
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new meeting
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      meetingType,
      date,
      duration,
      participants
    } = req.body;
    
    const meeting = new Meeting({
      title,
      description,
      meetingType,
      date,
      duration,
      participants,
      organizer: req.user.userId
    });
    
    await meeting.save();
    
    res.status(201).json(meeting);
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a meeting
router.put('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Check if user is the organizer
    if (meeting.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const {
      title,
      description,
      meetingType,
      date,
      duration,
      participants,
      status
    } = req.body;
    
    // Update fields
    if (title) meeting.title = title;
    if (description) meeting.description = description;
    if (meetingType) meeting.meetingType = meetingType;
    if (date) meeting.date = date;
    if (duration) meeting.duration = duration;
    if (participants) meeting.participants = participants;
    if (status) meeting.status = status;
    
    await meeting.save();
    
    res.json(meeting);
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a meeting
router.delete('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Check if user is the organizer
    if (meeting.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await meeting.remove();
    
    res.json({ message: 'Meeting removed' });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add transcript to a meeting
router.post('/:id/transcript', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Check if user is authorized
    if (
      meeting.organizer.toString() !== req.user.userId &&
      !meeting.participants.includes(req.user.userId)
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { transcript } = req.body;
    
    meeting.transcript = transcript;
    meeting.status = 'completed';
    
    await meeting.save();
    
    res.json(meeting);
  } catch (error) {
    console.error('Add transcript error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update meeting summary
router.put('/:id/summary', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Check if user is authorized
    if (
      meeting.organizer.toString() !== req.user.userId &&
      !meeting.participants.includes(req.user.userId)
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { summary, isEdited } = req.body;
    
    if (isEdited) {
      meeting.summary.userEdited = summary;
      meeting.summary.isEdited = true;
    } else {
      meeting.summary.aiGenerated = summary;
    }
    
    await meeting.save();
    
    res.json(meeting);
  } catch (error) {
    console.error('Update summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
