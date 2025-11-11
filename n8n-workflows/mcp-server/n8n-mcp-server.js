#!/usr/bin/env node

/**
 * N8N MCP Server
 * Model Context Protocol server for integrating Claude with N8N workflows
 * @version 1.0.0
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const axios = require('axios');

// Configuration
const N8N_API_URL = process.env.N8N_API_URL || 'http://localhost:5678/api/v1';
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!N8N_API_KEY) {
  console.error('Error: N8N_API_KEY environment variable is required');
  process.exit(1);
}

// Initialize N8N API client
const n8nClient = axios.create({
  baseURL: N8N_API_URL,
  headers: {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// MCP Server instance
const server = new Server(
  {
    name: 'n8n-automation-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'trigger_workflow',
        description: 'Trigger an N8N workflow with optional input data',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'The ID or name of the workflow to trigger',
            },
            data: {
              type: 'object',
              description: 'Optional input data to pass to the workflow',
              default: {},
            },
          },
          required: ['workflowId'],
        },
      },
      {
        name: 'get_workflow_status',
        description: 'Get the execution status of a workflow',
        inputSchema: {
          type: 'object',
          properties: {
            executionId: {
              type: 'string',
              description: 'The execution ID to check',
            },
          },
          required: ['executionId'],
        },
      },
      {
        name: 'list_workflows',
        description: 'List all available N8N workflows',
        inputSchema: {
          type: 'object',
          properties: {
            active: {
              type: 'boolean',
              description: 'Filter by active status',
              default: null,
            },
            limit: {
              type: 'number',
              description: 'Maximum number of workflows to return',
              default: 50,
            },
          },
        },
      },
      {
        name: 'query_data_table',
        description: 'Query data from an N8N data table',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Name of the data table',
            },
            filters: {
              type: 'object',
              description: 'Filter conditions for the query',
              default: {},
            },
            limit: {
              type: 'number',
              description: 'Maximum number of rows to return',
              default: 100,
            },
          },
          required: ['tableName'],
        },
      },
      {
        name: 'insert_data_table',
        description: 'Insert data into an N8N data table',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Name of the data table',
            },
            data: {
              type: 'object',
              description: 'Data to insert',
            },
          },
          required: ['tableName', 'data'],
        },
      },
      {
        name: 'update_data_table',
        description: 'Update data in an N8N data table',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Name of the data table',
            },
            id: {
              type: 'string',
              description: 'Row ID to update',
            },
            data: {
              type: 'object',
              description: 'Updated data',
            },
          },
          required: ['tableName', 'id', 'data'],
        },
      },
      {
        name: 'create_webhook',
        description: 'Create a new webhook endpoint',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'Workflow ID to attach webhook to',
            },
            path: {
              type: 'string',
              description: 'Webhook URL path',
            },
            method: {
              type: 'string',
              description: 'HTTP method',
              enum: ['GET', 'POST', 'PUT', 'DELETE'],
              default: 'POST',
            },
          },
          required: ['workflowId', 'path'],
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
      case 'trigger_workflow': {
        const { workflowId, data = {} } = args;
        const response = await n8nClient.post(
          `/workflows/${workflowId}/execute`,
          data
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  executionId: response.data.executionId,
                  status: response.data.status,
                  message: `Workflow ${workflowId} triggered successfully`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_workflow_status': {
        const { executionId } = args;
        const response = await n8nClient.get(`/executions/${executionId}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  executionId: response.data.id,
                  status: response.data.status,
                  startedAt: response.data.startedAt,
                  finishedAt: response.data.finishedAt,
                  data: response.data.data,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'list_workflows': {
        const { active, limit = 50 } = args;
        const params = { limit };
        if (active !== null) params.active = active;

        const response = await n8nClient.get('/workflows', { params });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  workflows: response.data.data.map((w) => ({
                    id: w.id,
                    name: w.name,
                    active: w.active,
                    tags: w.tags,
                    createdAt: w.createdAt,
                    updatedAt: w.updatedAt,
                  })),
                  total: response.data.data.length,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'query_data_table': {
        const { tableName, filters = {}, limit = 100 } = args;
        // Custom implementation for data table queries
        const response = await n8nClient.post(`/data-tables/${tableName}/query`, {
          filters,
          limit,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  tableName,
                  rows: response.data.rows,
                  count: response.data.rows.length,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'insert_data_table': {
        const { tableName, data } = args;
        const response = await n8nClient.post(
          `/data-tables/${tableName}/rows`,
          data
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  tableName,
                  id: response.data.id,
                  message: 'Data inserted successfully',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'update_data_table': {
        const { tableName, id, data } = args;
        const response = await n8nClient.put(
          `/data-tables/${tableName}/rows/${id}`,
          data
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  tableName,
                  id,
                  message: 'Data updated successfully',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'create_webhook': {
        const { workflowId, path, method = 'POST' } = args;
        const response = await n8nClient.post('/webhooks', {
          workflowId,
          path,
          method,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  webhookId: response.data.id,
                  url: response.data.url,
                  path,
                  method,
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
  console.error('N8N MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
