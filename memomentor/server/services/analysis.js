const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analyze meeting transcript and extract key information
 * @param {string} transcript - The meeting transcript
 * @param {string} meetingType - The type of meeting
 * @param {Object} userPreferences - User preferences for analysis
 * @returns {Promise<Object>} - Structured meeting summary
 */
async function analyzeMeeting(transcript, meetingType, userPreferences = {}) {
  try {
    // Default preferences if not provided
    const preferences = {
      includeActionItems: true,
      includeDecisions: true,
      includeKeyPoints: true,
      includeQuestions: true,
      ...userPreferences
    };
    
    // Build the prompt based on meeting type and preferences
    let prompt = `
      You are an AI meeting assistant helping to summarize a ${meetingType} meeting.
      Please analyze the following transcript and extract:
    `;
    
    if (preferences.includeKeyPoints) {
      prompt += "\n1. Key discussion points";
    }
    
    if (preferences.includeDecisions) {
      prompt += "\n2. Decisions made";
    }
    
    if (preferences.includeActionItems) {
      prompt += "\n3. Action items (with assignees if mentioned)";
    }
    
    if (preferences.includeQuestions) {
      prompt += "\n4. Questions that need follow-up";
    }
    
    prompt += `
      
      Format the output in a structured JSON with these categories.
      
      Transcript:
      ${transcript}
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful meeting assistant that extracts structured information from meeting transcripts." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
}

/**
 * Process feedback from user edits to improve future analyses
 * @param {Object} originalAnalysis - The AI-generated analysis
 * @param {Object} userEdits - The user's edited version
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Personalized prompt additions
 */
async function processFeedback(originalAnalysis, userEdits, userId) {
  try {
    // Compare the original analysis with user edits to identify patterns
    const differences = compareSummaries(originalAnalysis, userEdits);
    
    // Generate personalized prompt additions based on the differences
    const prompt = `
      I'm an AI assistant that helps summarize meetings. I want to learn from user feedback.
      
      Original AI analysis:
      ${JSON.stringify(originalAnalysis, null, 2)}
      
      User's edited version:
      ${JSON.stringify(userEdits, null, 2)}
      
      Based on these differences, what specific instructions should be added to my prompt
      to better match this user's preferences in the future? Focus on patterns like:
      - Level of detail preferred
      - Style of writing
      - Types of items they add or remove
      - How they structure information
      
      Return your answer as a JSON object with a "promptAdditions" field containing
      specific instructions to add to future prompts.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful AI assistant that analyzes differences between AI outputs and human edits." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Feedback processing error:', error);
    throw error;
  }
}

/**
 * Compare original AI summary with user edits to identify differences
 * @param {Object} original - The original AI-generated summary
 * @param {Object} edited - The user-edited summary
 * @returns {Object} - Analysis of differences
 */
function compareSummaries(original, edited) {
  const differences = {
    added: {
      keyPoints: [],
      decisions: [],
      actionItems: [],
      questions: []
    },
    removed: {
      keyPoints: [],
      decisions: [],
      actionItems: [],
      questions: []
    },
    modified: {
      keyPoints: [],
      decisions: [],
      actionItems: [],
      questions: []
    }
  };
  
  // Compare key points
  if (original.keyPoints && edited.keyPoints) {
    differences.added.keyPoints = edited.keyPoints.filter(item => !original.keyPoints.includes(item));
    differences.removed.keyPoints = original.keyPoints.filter(item => !edited.keyPoints.includes(item));
  }
  
  // Compare decisions
  if (original.decisions && edited.decisions) {
    differences.added.decisions = edited.decisions.filter(item => !original.decisions.includes(item));
    differences.removed.decisions = original.decisions.filter(item => !edited.decisions.includes(item));
  }
  
  // Compare questions
  if (original.questions && edited.questions) {
    differences.added.questions = edited.questions.filter(item => !original.questions.includes(item));
    differences.removed.questions = original.questions.filter(item => !edited.questions.includes(item));
  }
  
  // Action items require special handling due to their structure
  if (original.actionItems && edited.actionItems) {
    // This is a simplified comparison - in a real app, you'd need more sophisticated matching
    const originalDescriptions = original.actionItems.map(item => item.description);
    const editedDescriptions = edited.actionItems.map(item => item.description);
    
    differences.added.actionItems = edited.actionItems.filter(item => 
      !originalDescriptions.includes(item.description));
    differences.removed.actionItems = original.actionItems.filter(item => 
      !editedDescriptions.includes(item.description));
  }
  
  return differences;
}

module.exports = { 
  analyzeMeeting,
  processFeedback
};
