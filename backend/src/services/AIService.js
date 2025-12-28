import fetch from 'node-fetch';

export class AIService {
  constructor() {
    this.stats = {
      totalQueries: 0,
      avgLatency: 0,
      moderations: 0
    };
  }

  async moderateContent(text) {
    const start = Date.now();
    try {
      const res = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_KEY}`
        },
        body: JSON.stringify({ input: text })
      });

      const { results } = await res.json();
      this.stats.moderations++;

      const flagged = results[0].flagged;
      const categories = Object.keys(results[0].categories).filter(
        k => results[0].categories[k]
      );

      // Calculate confidence score
      const maxScore = Math.max(...Object.values(results[0].category_scores));
      const confidence = flagged ? maxScore : 1 - maxScore;

      return {
        toxic: flagged,
        toxicity: maxScore,
        confidence,
        categories,
        latency: Date.now() - start
      };
    } catch (error) {
      console.error('Moderation error:', error);
      return { toxic: false, confidence: 0, error: error.message };
    }
  }

  async chat(message, model = 'ministral-3b') {
    const start = Date.now();
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: message,
          stream: false
        })
      });

      const data = await res.json();
      const latency = Date.now() - start;

      this.stats.totalQueries++;
      this.stats.avgLatency =
        (this.stats.avgLatency * (this.stats.totalQueries - 1) + latency) /
        this.stats.totalQueries;

      return data.response;
    } catch (error) {
      console.error('Chat error:', error);
      return 'Sorry, AI is temporarily unavailable.';
    }
  }

  getStats() {
    return this.stats;
  }
}
