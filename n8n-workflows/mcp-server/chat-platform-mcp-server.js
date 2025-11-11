#!/usr/bin/env node

/**
 * Chat Platform MCP Server
 * Multi-platform chat integration server (WhatsApp, Telegram, etc.)
 * @version 1.0.0
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Configuration
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_DB_PATH = process.env.CHAT_DB_PATH || './chat-history.db';

// Initialize database
const db = new sqlite3.Database(CHAT_DB_PATH);

// Create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      message TEXT NOT NULL,
      direction TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      metadata TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      preferences TEXT,
      last_active DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_conversations_user_id
    ON conversations(user_id)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_conversations_timestamp
    ON conversations(timestamp)
  `);
});

// API clients
const whatsappClient = WHATSAPP_API_URL
  ? axios.create({
      baseURL: WHATSAPP_API_URL,
      headers: {
        Authorization: `Bearer ${WHATSAPP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    })
  : null;

const telegramClient = TELEGRAM_BOT_TOKEN
  ? axios.create({
      baseURL: `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`,
      timeout: 15000,
    })
  : null;

// MCP Server instance
const server = new Server(
  {
    name: 'chat-platform-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Database helper functions
 */
function dbRun(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function dbAll(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function dbGet(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'send_whatsapp_message',
        description: 'Send a message via WhatsApp',
        inputSchema: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'Recipient phone number',
            },
            message: {
              type: 'string',
              description: 'Message content',
            },
            media_url: {
              type: 'string',
              description: 'Optional media URL',
            },
          },
          required: ['to', 'message'],
        },
      },
      {
        name: 'send_telegram_message',
        description: 'Send a message via Telegram',
        inputSchema: {
          type: 'object',
          properties: {
            chat_id: {
              type: 'string',
              description: 'Telegram chat ID',
            },
            message: {
              type: 'string',
              description: 'Message content',
            },
            parse_mode: {
              type: 'string',
              description: 'Parse mode (Markdown, HTML)',
              enum: ['Markdown', 'HTML'],
            },
          },
          required: ['chat_id', 'message'],
        },
      },
      {
        name: 'get_conversation_history',
        description: 'Get conversation history for a user',
        inputSchema: {
          type: 'object',
          properties: {
            user_id: {
              type: 'string',
              description: 'User ID',
            },
            platform: {
              type: 'string',
              description: 'Platform (whatsapp, telegram)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of messages',
              default: 50,
            },
          },
          required: ['user_id'],
        },
      },
      {
        name: 'save_conversation',
        description: 'Save a conversation message to history',
        inputSchema: {
          type: 'object',
          properties: {
            user_id: {
              type: 'string',
              description: 'User ID',
            },
            platform: {
              type: 'string',
              description: 'Platform (whatsapp, telegram)',
            },
            message: {
              type: 'string',
              description: 'Message content',
            },
            direction: {
              type: 'string',
              description: 'Message direction (incoming, outgoing)',
              enum: ['incoming', 'outgoing'],
            },
            metadata: {
              type: 'object',
              description: 'Additional metadata',
            },
          },
          required: ['user_id', 'platform', 'message', 'direction'],
        },
      },
      {
        name: 'get_user_preferences',
        description: 'Get user preferences',
        inputSchema: {
          type: 'object',
          properties: {
            user_id: {
              type: 'string',
              description: 'User ID',
            },
          },
          required: ['user_id'],
        },
      },
      {
        name: 'set_user_preferences',
        description: 'Set user preferences',
        inputSchema: {
          type: 'object',
          properties: {
            user_id: {
              type: 'string',
              description: 'User ID',
            },
            platform: {
              type: 'string',
              description: 'Platform (whatsapp, telegram)',
            },
            preferences: {
              type: 'object',
              description: 'User preferences object',
            },
          },
          required: ['user_id', 'platform', 'preferences'],
        },
      },
      {
        name: 'send_batch_messages',
        description: 'Send multiple messages with delays',
        inputSchema: {
          type: 'object',
          properties: {
            platform: {
              type: 'string',
              description: 'Platform (whatsapp, telegram)',
              enum: ['whatsapp', 'telegram'],
            },
            recipient: {
              type: 'string',
              description: 'Recipient ID (phone or chat_id)',
            },
            messages: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of messages to send',
            },
            delay_ms: {
              type: 'number',
              description: 'Delay between messages in milliseconds',
              default: 1000,
            },
          },
          required: ['platform', 'recipient', 'messages'],
        },
      },
      {
        name: 'search_conversations',
        description: 'Search through conversation history',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
            user_id: {
              type: 'string',
              description: 'Filter by user ID',
            },
            platform: {
              type: 'string',
              description: 'Filter by platform',
            },
            start_date: {
              type: 'string',
              description: 'Start date (ISO format)',
            },
            end_date: {
              type: 'string',
              description: 'End date (ISO format)',
            },
            limit: {
              type: 'number',
              description: 'Maximum results',
              default: 50,
            },
          },
          required: ['query'],
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'send_whatsapp_message': {
        if (!whatsappClient) {
          throw new Error('WhatsApp client not configured');
        }

        const { to, message, media_url } = args;
        const payload = {
          to,
          type: media_url ? 'media' : 'text',
          [media_url ? 'media' : 'text']: {
            body: message,
            ...(media_url && { url: media_url }),
          },
        };

        const response = await whatsappClient.post('/messages', payload);

        // Save to conversation history
        await dbRun(
          'INSERT INTO conversations (user_id, platform, message, direction) VALUES (?, ?, ?, ?)',
          [to, 'whatsapp', message, 'outgoing']
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  platform: 'whatsapp',
                  message_id: response.data.id,
                  to,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'send_telegram_message': {
        if (!telegramClient) {
          throw new Error('Telegram client not configured');
        }

        const { chat_id, message, parse_mode } = args;
        const payload = {
          chat_id,
          text: message,
          ...(parse_mode && { parse_mode }),
        };

        const response = await telegramClient.post('/sendMessage', payload);

        // Save to conversation history
        await dbRun(
          'INSERT INTO conversations (user_id, platform, message, direction) VALUES (?, ?, ?, ?)',
          [chat_id, 'telegram', message, 'outgoing']
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  platform: 'telegram',
                  message_id: response.data.result.message_id,
                  chat_id,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_conversation_history': {
        const { user_id, platform, limit = 50 } = args;
        const query = platform
          ? 'SELECT * FROM conversations WHERE user_id = ? AND platform = ? ORDER BY timestamp DESC LIMIT ?'
          : 'SELECT * FROM conversations WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?';
        const params = platform ? [user_id, platform, limit] : [user_id, limit];

        const messages = await dbAll(query, params);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  user_id,
                  platform,
                  message_count: messages.length,
                  messages: messages.reverse(),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'save_conversation': {
        const { user_id, platform, message, direction, metadata } = args;
        await dbRun(
          'INSERT INTO conversations (user_id, platform, message, direction, metadata) VALUES (?, ?, ?, ?, ?)',
          [user_id, platform, message, direction, JSON.stringify(metadata || {})]
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Conversation saved',
              }),
            },
          ],
        };
      }

      case 'get_user_preferences': {
        const { user_id } = args;
        const prefs = await dbGet(
          'SELECT * FROM user_preferences WHERE user_id = ?',
          [user_id]
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  user_id,
                  preferences: prefs ? JSON.parse(prefs.preferences) : {},
                  platform: prefs?.platform,
                  last_active: prefs?.last_active,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'set_user_preferences': {
        const { user_id, platform, preferences } = args;
        await dbRun(
          `INSERT OR REPLACE INTO user_preferences (user_id, platform, preferences, last_active)
           VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
          [user_id, platform, JSON.stringify(preferences)]
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Preferences saved',
              }),
            },
          ],
        };
      }

      case 'send_batch_messages': {
        const { platform, recipient, messages, delay_ms = 1000 } = args;
        const results = [];

        for (let i = 0; i < messages.length; i++) {
          const message = messages[i];

          try {
            if (platform === 'whatsapp' && whatsappClient) {
              const response = await whatsappClient.post('/messages', {
                to: recipient,
                type: 'text',
                text: { body: message },
              });
              results.push({
                index: i,
                success: true,
                message_id: response.data.id,
              });

              await dbRun(
                'INSERT INTO conversations (user_id, platform, message, direction) VALUES (?, ?, ?, ?)',
                [recipient, 'whatsapp', message, 'outgoing']
              );
            } else if (platform === 'telegram' && telegramClient) {
              const response = await telegramClient.post('/sendMessage', {
                chat_id: recipient,
                text: message,
              });
              results.push({
                index: i,
                success: true,
                message_id: response.data.result.message_id,
              });

              await dbRun(
                'INSERT INTO conversations (user_id, platform, message, direction) VALUES (?, ?, ?, ?)',
                [recipient, 'telegram', message, 'outgoing']
              );
            }

            // Delay between messages (except for the last one)
            if (i < messages.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, delay_ms));
            }
          } catch (error) {
            results.push({
              index: i,
              success: false,
              error: error.message,
            });
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  platform,
                  recipient,
                  total_messages: messages.length,
                  results,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'search_conversations': {
        const { query, user_id, platform, start_date, end_date, limit = 50 } =
          args;

        let sql = 'SELECT * FROM conversations WHERE message LIKE ?';
        const params = [`%${query}%`];

        if (user_id) {
          sql += ' AND user_id = ?';
          params.push(user_id);
        }

        if (platform) {
          sql += ' AND platform = ?';
          params.push(platform);
        }

        if (start_date) {
          sql += ' AND timestamp >= ?';
          params.push(start_date);
        }

        if (end_date) {
          sql += ' AND timestamp <= ?';
          params.push(end_date);
        }

        sql += ' ORDER BY timestamp DESC LIMIT ?';
        params.push(limit);

        const results = await dbAll(sql, params);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  query,
                  result_count: results.length,
                  results,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: true,
              message: error.message,
              details: error.response?.data || error.toString(),
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Chat Platform MCP Server running on stdio');
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.error('Closing database connection...');
  db.close();
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error in main():', error);
  db.close();
  process.exit(1);
});
