// ChatGPT integration service
require('dotenv').config();

/**
 * Generate content using a mock implementation
 * @param {string} platform - The platform to generate content for
 * @param {string} prompt - Optional custom prompt
 * @returns {Promise<string|object>} - The generated content
 */
async function generateWithChatGPT(platform, prompt = '') {
  try {
    console.log(`AI Service: Generating content for ${platform} with prompt: ${prompt || 'default'}`);

    // Validate platform
    const validPlatforms = ['linkedin', 'instagram', 'twitter', 'facebook', 'youtube', 'common'];
    if (!validPlatforms.includes(platform)) {
      throw new Error(`Invalid platform: ${platform}. Valid platforms are: ${validPlatforms.join(', ')}`);
    }

    // Extract topic from prompt or use default
    let topic = '';
    if (prompt && prompt.toLowerCase().includes('about')) {
      // Extract topic from prompt
      const aboutMatch = prompt.match(/about\s+([^.!?,]+)/i);
      if (aboutMatch && aboutMatch[1]) {
        topic = aboutMatch[1].trim();
      }
    }

    if (!topic && prompt) {
      // Use the prompt as the topic
      topic = prompt;
    } else if (!topic) {
      // Use a default topic if none provided
      const topics = ['digital marketing', 'social media strategy', 'content creation', 'brand awareness', 'customer engagement'];
      topic = topics[Math.floor(Math.random() * topics.length)];
    }

    console.log(`Using topic: ${topic}`);

    // Mock content based on platform
    let content;

    switch (platform) {
      case 'linkedin':
        content = `📊 Transforming Your ${topic} Strategy: Key Insights for 2023\n\nAre you leveraging the full potential of your ${topic} approach? Recent studies show that businesses implementing strategic ${topic} see 3.5x higher engagement rates.\n\nKey findings:\n• 78% of industry leaders prioritize ${topic} in their growth strategy\n• Companies with dedicated ${topic} teams report 45% higher ROI\n• Consistent ${topic} implementation leads to 67% better customer retention\n\nWhat's your biggest challenge with ${topic}? Share below!\n\n#${topic.replace(/\s+/g, '')} #BusinessStrategy #GrowthHacking #ProfessionalDevelopment`;
        break;

      case 'instagram':
        content = `✨ Elevate Your ${topic} Game! ✨\n\nSwipe through for 5 game-changing tips that will transform your approach to ${topic}! 👉\n\nDid you know? Only 24% of brands are fully leveraging the power of ${topic} - be among the leaders! 📈\n\n💡 Tip #1: Start with clear goals\n💡 Tip #2: Analyze your audience deeply\n💡 Tip #3: Create consistent, quality content\n💡 Tip #4: Engage authentically with your community\n💡 Tip #5: Measure and adapt your strategy\n\nDouble tap if you're ready to level up your ${topic} strategy! 💪\n\nTag a friend who needs to see this! 👇\n\n#${topic.replace(/\s+/g, '')} #StrategyTips #GrowthMindset #ContentCreation #DigitalMarketing`;
        break;

      case 'twitter':
        content = `Want to revolutionize your ${topic} approach? Our latest research shows companies that prioritize ${topic} see 3x better results. Learn how: [link] #${topic.replace(/\s+/g, '')} #GrowthStrategy`;
        break;

      case 'facebook':
        content = `🚀 TRANSFORM YOUR ${topic.toUpperCase()} STRATEGY TODAY! 🚀\n\nAre you struggling to see results from your ${topic} efforts? You're not alone! Our recent survey found that 67% of businesses face the same challenge.\n\nHere's what actually works in 2023:\n\n✅ Focus on authentic engagement over vanity metrics\n✅ Create value-driven content that solves real problems\n✅ Build community through consistent interaction\n✅ Leverage data to refine your approach\n\nCheck out our latest infographic that breaks down the complete ${topic} success formula! 👇\n\nWhat's your biggest ${topic} challenge? Comment below and let's solve it together!`;
        break;

      case 'youtube':
        content = {
          title: `Ultimate Guide to ${topic.charAt(0).toUpperCase() + topic.slice(1)} | Top 5 Techniques for Success`,
          description: `Watch this comprehensive video about ${topic} and discover proven techniques that can transform your results.\n\n🔍 TIMESTAMPS:\n00:00 Introduction to ${topic}\n02:15 Technique #1: Understanding the Fundamentals\n05:40 Technique #2: Advanced Implementation\n09:25 Technique #3: Optimization Strategies\n13:50 Technique #4: Measuring Success\n17:30 Technique #5: Future Trends\n21:15 Conclusion and Action Steps\n\nResources mentioned in this video:\n- Free ${topic} guide: [LINK]\n- ${topic} community: [LINK]\n\nDon't forget to LIKE, SUBSCRIBE, and hit the NOTIFICATION BELL to stay updated with our latest videos on ${topic}!`,
          tags: `${topic}, tutorial, how-to, guide, tips and tricks, ${new Date().getFullYear()}, best practices, youtube content, video guide`
        };
        break;

      case 'common':
        content = `📣 The Ultimate Guide to ${topic} 📣\n\nTransform your approach to ${topic} with these proven strategies:\n\n✅ Set clear, measurable goals\n✅ Understand your audience deeply\n✅ Create consistent, quality content\n✅ Engage authentically\n✅ Analyze and adapt regularly\n\nDid you know? Businesses that prioritize ${topic} see an average of 2.7x better results!\n\nWhat's your favorite ${topic} tip? Share below!\n\n#${topic.replace(/\s+/g, '')} #DigitalStrategy #GrowthTips`;
        break;

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    console.log(`Generated content for ${platform}:`, typeof content === 'object' ? 'Object with properties' : content.substring(0, 50) + '...');
    return content;

  } catch (error) {
    console.error('Error generating content with AI:', error);
    throw error;
  }
}

module.exports = { generateWithChatGPT };
