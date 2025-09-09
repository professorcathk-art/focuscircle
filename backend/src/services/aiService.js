const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.AIML_API_KEY,
  baseURL: 'https://api.aimlapi.com/v1',
});

class AIService {
  constructor() {
    this.model = 'mistralai/Mistral-7B-Instruct-v0.2';
    this.maxTokens = 1000;
  }

  async generateSummary(title, content, category) {
    try {
      const startTime = Date.now();
      
      const prompt = this.buildSummaryPrompt(title, content, category);
      
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert content summarizer and classifier. Your job is to create concise, informative summaries and classify content based on importance and relevance.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.3,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      const processingTime = Date.now() - startTime;
      const aiResponse = response.choices[0].message.content;
      
      return this.parseAIResponse(aiResponse, processingTime);
    } catch (error) {
      console.error('AI service error:', error);
      throw new Error(`AI summarization failed: ${error.message}`);
    }
  }

  buildSummaryPrompt(title, content, category) {
    return `
Please analyze the following content and provide a structured response in JSON format:

Title: ${title}
Category: ${category}
Content: ${content.substring(0, 4000)} ${content.length > 4000 ? '...[truncated]' : ''}

Please provide your response in the following JSON format:
{
  "summary": "A concise 2-3 sentence summary of the main points",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "classification": {
    "tier": "tier1" or "tier2",
    "category": "${category}",
    "tags": ["tag1", "tag2", "tag3"],
    "sentiment": "positive", "negative", or "neutral",
    "urgency": "low", "medium", "high", or "critical"
  },
  "reasoning": "Brief explanation of the classification decisions"
}

Classification Guidelines:
- Tier 1 (Critical): Breaking news, major announcements, urgent updates, significant changes
- Tier 2 (Informational): Regular updates, minor news, background information, routine content
- Sentiment: Overall tone of the content
- Urgency: How time-sensitive the information is
- Tags: Relevant keywords and topics (3-5 tags maximum)

Focus on accuracy and relevance. The summary should be informative but concise.
    `.trim();
  }

  parseAIResponse(response, processingTime) {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!parsed.summary || !parsed.classification) {
        throw new Error('Invalid AI response structure');
      }

      // Ensure classification has required fields
      const classification = {
        tier: parsed.classification.tier || 'tier2',
        category: parsed.classification.category || 'other',
        tags: parsed.classification.tags || [],
        sentiment: parsed.classification.sentiment || 'neutral',
        urgency: parsed.classification.urgency || 'medium'
      };

      return {
        summary: parsed.summary,
        keyPoints: parsed.keyPoints || [],
        classification,
        metadata: {
          model: this.model,
          processingTime,
          confidence: 0.8, // Could be calculated based on response quality
          reasoning: parsed.reasoning || ''
        }
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Raw response:', response);
      
      // Fallback response
      return {
        summary: 'Content summary could not be generated due to processing error.',
        keyPoints: ['Content processing failed'],
        classification: {
          tier: 'tier2',
          category: 'other',
          tags: ['error'],
          sentiment: 'neutral',
          urgency: 'low'
        },
        metadata: {
          model: this.model,
          processingTime,
          confidence: 0.1,
          reasoning: 'Fallback due to parsing error'
        }
      };
    }
  }

  async improveSummaryWithFeedback(summaryId, userFeedback) {
    try {
      // This would be used to improve future summaries based on user feedback
      // For now, we'll just log the feedback for future ML training
      console.log('User feedback received:', {
        summaryId,
        feedback: userFeedback
      });

      // In a production system, this would:
      // 1. Store feedback in a training dataset
      // 2. Retrain models periodically
      // 3. Adjust classification algorithms
      // 4. Update user preference models

      return { success: true, message: 'Feedback recorded for model improvement' };
    } catch (error) {
      console.error('Feedback processing error:', error);
      throw error;
    }
  }

  async generateTrendingTopics(userId, summaries) {
    try {
      // Analyze user's summary history to identify trending topics
      const content = summaries.map(s => `${s.title}: ${s.content.summary}`).join('\n\n');
      
      const prompt = `
Analyze the following summaries and identify the most trending topics and themes:

${content}

Please provide a JSON response with:
{
  "trendingTopics": [
    {
      "topic": "topic name",
      "frequency": number,
      "relevance": "high", "medium", or "low",
      "relatedTags": ["tag1", "tag2"]
    }
  ],
  "insights": "Brief analysis of trending patterns"
}
      `;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a trend analysis expert. Identify patterns and trending topics in content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.5
      });

      const aiResponse = response.choices[0].message.content;
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid AI response format');
      }
    } catch (error) {
      console.error('Trending topics generation error:', error);
      return {
        trendingTopics: [],
        insights: 'Unable to generate trending topics at this time'
      };
    }
  }

  async suggestRelatedContent(currentSummary, userHistory) {
    try {
      // Suggest related content based on current summary and user history
      const prompt = `
Based on this summary and user's reading history, suggest related content:

Current Summary:
Title: ${currentSummary.title}
Content: ${currentSummary.content.summary}
Tags: ${currentSummary.classification.tags.join(', ')}

User History (recent summaries):
${userHistory.slice(0, 10).map(s => `- ${s.title} (${s.classification.tags.join(', ')})`).join('\n')}

Provide suggestions in JSON format:
{
  "suggestions": [
    {
      "type": "similar_content" or "related_topic",
      "reason": "Why this is relevant",
      "confidence": 0.0-1.0
    }
  ]
}
      `;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a content recommendation expert. Suggest relevant content based on user interests.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.6
      });

      const aiResponse = response.choices[0].message.content;
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        return { suggestions: [] };
      }
    } catch (error) {
      console.error('Content suggestion error:', error);
      return { suggestions: [] };
    }
  }
}

module.exports = new AIService();
