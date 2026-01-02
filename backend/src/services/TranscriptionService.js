import fetch from 'node-fetch';
import { createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

/**
 * TranscriptionService - Real-time speech-to-text with AI translation
 * Uses OpenAI Whisper API for transcription and GPT for translation
 */
export class TranscriptionService {
  constructor() {
    this.activeStreams = new Map(); // streamId -> transcription session
    this.transcripts = new Map(); // streamId -> transcript history
    this.apiKey = process.env.OPENAI_KEY;
  }

  /**
   * Start real-time transcription for an audio stream
   * @param {string} streamId - Stream identifier
   * @param {string} language - Source language code (e.g., 'en', 'es', 'fr')
   * @param {string} targetLanguage - Target language for translation (optional)
   */
  async startTranscription(streamId, language = 'en', targetLanguage = null) {
    const session = {
      streamId,
      language,
      targetLanguage,
      enabled: true,
      lastTranscript: '',
      buffer: [],
      startTime: Date.now()
    };

    this.activeStreams.set(streamId, session);
    this.transcripts.set(streamId, []);

    console.log(`✅ Transcription started for stream: ${streamId} (${language})`);
    return session;
  }

  /**
   * Transcribe audio chunk using Whisper API
   * @param {string} streamId - Stream identifier
   * @param {Buffer} audioBuffer - Audio data (WAV format)
   */
  async transcribeChunk(streamId, audioBuffer) {
    const session = this.activeStreams.get(streamId);
    if (!session || !session.enabled) return null;

    try {
      const formData = new FormData();
      formData.append('file', new Blob([audioBuffer]), 'audio.wav');
      formData.append('model', 'whisper-1');
      formData.append('language', session.language);
      formData.append('response_format', 'verbose_json');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.text) {
        const transcript = {
          text: result.text,
          language: session.language,
          timestamp: new Date(),
          confidence: result.confidence || 1.0,
          duration: result.duration
        };

        // Translate if target language specified
        if (session.targetLanguage && session.targetLanguage !== session.language) {
          transcript.translation = await this.translateText(
            result.text,
            session.language,
            session.targetLanguage
          );
        }

        // Store transcript
        const history = this.transcripts.get(streamId) || [];
        history.push(transcript);
        this.transcripts.set(streamId, history);

        session.lastTranscript = result.text;

        return transcript;
      }

      return null;
    } catch (error) {
      console.error(`❌ Transcription error: ${error.message}`);
      return null;
    }
  }

  /**
   * Translate text using GPT
   * @param {string} text - Text to translate
   * @param {string} sourceLanguage - Source language code
   * @param {string} targetLanguage - Target language code
   */
  async translateText(text, sourceLanguage, targetLanguage) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Return ONLY the translation, no explanations.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3
        })
      });

      const result = await response.json();
      return result.choices[0].message.content;
    } catch (error) {
      console.error(`❌ Translation error: ${error.message}`);
      return text; // Return original if translation fails
    }
  }

  /**
   * Get current caption/subtitle text for display
   * @param {string} streamId - Stream identifier
   * @returns {Object} - Caption data ready for overlay
   */
  getCurrentCaption(streamId) {
    const session = this.activeStreams.get(streamId);
    if (!session) return null;

    const history = this.transcripts.get(streamId) || [];
    const recent = history.slice(-3); // Last 3 transcripts

    return {
      current: session.lastTranscript,
      translated: session.targetLanguage ? recent[recent.length - 1]?.translation : null,
      history: recent.map(t => ({
        text: t.text,
        translation: t.translation,
        timestamp: t.timestamp
      }))
    };
  }

  /**
   * Generate HTML for subtitle overlay (for Browser Capture in PRISM)
   * @param {string} streamId - Stream identifier
   */
  generateSubtitleHTML(streamId) {
    const caption = this.getCurrentCaption(streamId);
    if (!caption) return '';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      background: transparent;
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      height: 100vh;
    }
    .subtitle-container {
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      margin-bottom: 50px;
      max-width: 80%;
      text-align: center;
    }
    .subtitle-text {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .subtitle-translation {
      font-size: 24px;
      color: #ffeb3b;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="subtitle-container">
    <div class="subtitle-text">${caption.current || ''}</div>
    ${caption.translated ? `<div class="subtitle-translation">${caption.translated}</div>` : ''}
  </div>
  <script>
    // Auto-refresh every 500ms
    setInterval(() => {
      fetch('/api/transcriptions/${streamId}/current')
        .then(r => r.json())
        .then(data => {
          document.querySelector('.subtitle-text').textContent = data.current || '';
          const translationEl = document.querySelector('.subtitle-translation');
          if (data.translated) {
            translationEl.textContent = data.translated;
            translationEl.style.display = 'block';
          } else {
            translationEl.style.display = 'none';
          }
        });
    }, 500);
  </script>
</body>
</html>`;

    return html;
  }

  /**
   * Stop transcription
   */
  stopTranscription(streamId) {
    const session = this.activeStreams.get(streamId);
    if (!session) return;

    session.enabled = false;
    this.activeStreams.delete(streamId);

    console.log(`⏹️ Transcription stopped for stream: ${streamId}`);
  }

  /**
   * Get full transcript history
   */
  getTranscript(streamId) {
    return this.transcripts.get(streamId) || [];
  }

  /**
   * Export transcript as SRT subtitle file
   */
  exportToSRT(streamId) {
    const transcripts = this.transcripts.get(streamId) || [];
    let srt = '';
    let index = 1;

    for (const transcript of transcripts) {
      const start = this.formatSRTTime(transcript.timestamp);
      const end = this.formatSRTTime(
        new Date(transcript.timestamp.getTime() + (transcript.duration || 2000))
      );

      srt += `${index}\n`;
      srt += `${start} --> ${end}\n`;
      srt += `${transcript.text}\n`;
      if (transcript.translation) {
        srt += `${transcript.translation}\n`;
      }
      srt += `\n`;
      index++;
    }

    return srt;
  }

  /**
   * Format timestamp for SRT format (00:00:00,000)
   * @private
   */
  formatSRTTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds},${milliseconds}`;
  }

  /**
   * Get transcription statistics
   */
  getStats(streamId) {
    const transcripts = this.transcripts.get(streamId) || [];
    const session = this.activeStreams.get(streamId);

    return {
      totalSegments: transcripts.length,
      totalDuration: transcripts.reduce((sum, t) => sum + (t.duration || 0), 0),
      averageConfidence: transcripts.reduce((sum, t) => sum + t.confidence, 0) / transcripts.length,
      language: session?.language,
      targetLanguage: session?.targetLanguage,
      isActive: session?.enabled || false
    };
  }
}
