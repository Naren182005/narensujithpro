const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  meetingType: {
    type: String,
    enum: ['standup', 'planning', 'retrospective', 'client', 'general'],
    default: 'general'
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 30
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transcript: {
    type: String,
    default: ''
  },
  summary: {
    aiGenerated: {
      keyPoints: [String],
      decisions: [String],
      actionItems: [{
        description: String,
        assignee: String
      }],
      questions: [String]
    },
    userEdited: {
      keyPoints: [String],
      decisions: [String],
      actionItems: [{
        description: String,
        assignee: String
      }],
      questions: [String]
    },
    isEdited: {
      type: Boolean,
      default: false
    }
  },
  recordingUrl: String,
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;
