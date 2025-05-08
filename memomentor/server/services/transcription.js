const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Transcribe audio using OpenAI's Whisper API
 * @param {Buffer} audioBuffer - The audio buffer to transcribe
 * @returns {Promise<string>} - The transcribed text
 */
async function transcribeAudio(audioBuffer) {
  try {
    const response = await openai.audio.transcriptions.create({
      file: audioBuffer,
      model: "whisper-1",
    });
    
    return response.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

module.exports = { transcribeAudio };
