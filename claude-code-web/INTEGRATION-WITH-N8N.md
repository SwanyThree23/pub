# Integration with N8N Workflows

> **Combine Claude Code for Web workflow with N8N automation for ultimate productivity**

---

## 🔄 Unified Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  CLAUDE CODE FOR WEB                                        │
│  ├─ Feature Development (4 agents)                         │
│  ├─ Research Tasks (2 agents)                              │
│  ├─ Optimization (1 agent)                                 │
│  └─ Security (1 agent)                                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
            GitHub Push (automated)
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  N8N WORKFLOWS                                              │
│  ├─ Detect GitHub Push                                     │
│  ├─ Run CI/CD Pipeline                                     │
│  ├─ Notify Team (Slack/Discord)                           │
│  ├─ Update Project Dashboard                               │
│  ├─ Deploy to Staging                                      │
│  └─ Send Status Reports                                    │
└─────────────────────────────────────────────────────────────┘
                        ↓
            Production Deployment
```

---

## 🎯 Integration Points

### 1. GitHub Webhook → N8N

**Trigger:** Code pushed from Claude Code for Web

**N8N Workflow:**
```json
{
  "nodes": [
    {
      "name": "GitHub Webhook",
      "type": "n8n-nodes-base.githubTrigger",
      "events": ["push"]
    },
    {
      "name": "Extract Commit Info",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "commitMessage": "={{ $json.head_commit.message }}",
          "author": "={{ $json.head_commit.author.name }}",
          "files": "={{ $json.head_commit.modified }}",
          "branch": "={{ $json.ref }}"
        }
      }
    },
    {
      "name": "Check if Claude Agent",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.commitMessage }}",
              "operation": "contains",
              "value2": "Claude Code for Web"
            }
          ]
        }
      }
    },
    {
      "name": "Notify Team",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "channel": "#dev-updates",
        "text": "🤖 AI Agent completed task: {{ $json.commitMessage }}"
      }
    }
  ]
}
```

---

### 2. Daily Progress Report

**Schedule:** Every morning at 9 AM

**N8N Workflow:**
```json
{
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [{"field": "hours", "hoursInterval": 24}]
        }
      }
    },
    {
      "name": "Fetch GitHub Commits",
      "type": "n8n-nodes-base.github",
      "parameters": {
        "operation": "getCommits",
        "owner": "your-username",
        "repository": "your-repo",
        "since": "={{ $now.minus({days: 1}).toISO() }}"
      }
    },
    {
      "name": "Filter AI Commits",
      "type": "n8n-nodes-base.filter",
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.commit.message }}",
              "operation": "contains",
              "value2": "Claude Code for Web"
            }
          ]
        }
      }
    },
    {
      "name": "Generate Report",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const commits = items.map(item => item.json.commit.message);\nconst count = commits.length;\nconst report = `📊 **Daily AI Development Report**\n\n✅ Tasks Completed: ${count}\n\n**Commits:**\n${commits.map((msg, i) => `${i+1}. ${msg}`).join('\n')}\n`;\n\nreturn [{json: {report}}];"
      }
    },
    {
      "name": "Send Email Report",
      "type": "n8n-nodes-base.gmail",
      "parameters": {
        "operation": "send",
        "to": "your-email@example.com",
        "subject": "Daily AI Development Report",
        "message": "={{ $json.report }}"
      }
    }
  ]
}
```

---

### 3. Automated Testing Pipeline

**Trigger:** Code pushed to integration branch

**N8N Workflow:**
```json
{
  "nodes": [
    {
      "name": "GitHub Push Webhook",
      "type": "n8n-nodes-base.githubTrigger",
      "parameters": {
        "events": ["push"],
        "branchOrTag": "integration-*"
      }
    },
    {
      "name": "Clone Repository",
      "type": "n8n-nodes-base.executeCommand",
      "parameters": {
        "command": "git clone {{ $json.repository.clone_url }} /tmp/test-repo && cd /tmp/test-repo"
      }
    },
    {
      "name": "Run Tests",
      "type": "n8n-nodes-base.executeCommand",
      "parameters": {
        "command": "cd /tmp/test-repo && npm install && npm test"
      }
    },
    {
      "name": "Check Test Results",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{ $json.code }}",
              "operation": "equal",
              "value2": 0
            }
          ]
        }
      }
    },
    {
      "name": "Tests Passed - Notify",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "channel": "#dev",
        "text": "✅ Tests passed for {{ $json.branch }}"
      }
    },
    {
      "name": "Tests Failed - Notify",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "channel": "#dev",
        "text": "❌ Tests failed for {{ $json.branch }}. Review needed."
      }
    }
  ]
}
```

---

### 4. Task Completion Notifications

**Purpose:** Get notified on phone/email when AI agents complete tasks

**N8N Workflow:**
```json
{
  "nodes": [
    {
      "name": "GitHub Webhook",
      "type": "n8n-nodes-base.githubTrigger",
      "events": ["push"]
    },
    {
      "name": "Check Branch Pattern",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.ref }}",
              "operation": "startsWith",
              "value2": "refs/heads/claude-"
            }
          ]
        }
      }
    },
    {
      "name": "Extract Task Info",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const branchName = items[0].json.ref.replace('refs/heads/', '');\nconst taskType = branchName.includes('feature') ? '🎨 Feature' : branchName.includes('security') ? '🔒 Security' : branchName.includes('optimize') ? '⚡ Optimization' : '📋 Task';\n\nreturn [{\n  json: {\n    taskType,\n    branchName,\n    message: items[0].json.head_commit.message\n  }\n}];"
      }
    },
    {
      "name": "Send Push Notification",
      "type": "n8n-nodes-base.pushover",
      "parameters": {
        "message": "{{ $json.taskType }} completed!\n\n{{ $json.message }}",
        "title": "Claude Agent Done ✅"
      }
    },
    {
      "name": "Send Email",
      "type": "n8n-nodes-base.gmail",
      "parameters": {
        "to": "your-email@example.com",
        "subject": "{{ $json.taskType }} Task Completed",
        "message": "Your AI agent has completed a task:\n\n{{ $json.message }}\n\nBranch: {{ $json.branchName }}\n\nReview at: {{ $json.repository.html_url }}"
      }
    }
  ]
}
```

---

### 5. Automated Deployment

**Purpose:** Deploy successfully tested code automatically

**N8N Workflow:**
```json
{
  "nodes": [
    {
      "name": "GitHub Push to Main",
      "type": "n8n-nodes-base.githubTrigger",
      "parameters": {
        "events": ["push"],
        "branchOrTag": "main"
      }
    },
    {
      "name": "Run Build",
      "type": "n8n-nodes-base.executeCommand",
      "parameters": {
        "command": "cd /app && git pull && npm install && npm run build"
      }
    },
    {
      "name": "Deploy to Vercel",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://api.vercel.com/v1/deployments",
        "headers": {
          "Authorization": "Bearer {{ $env.VERCEL_TOKEN }}"
        },
        "body": {
          "name": "your-app",
          "gitSource": {
            "type": "github",
            "repoId": "{{ $json.repository.id }}"
          }
        }
      }
    },
    {
      "name": "Notify Success",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "channel": "#deployments",
        "text": "🚀 Deployed to production!\n\nCommit: {{ $json.head_commit.message }}\nURL: {{ $json.deployment.url }}"
      }
    }
  ]
}
```

---

## 📊 Analytics Integration

### Track AI Agent Productivity

**N8N Workflow:** Daily metrics collection

```json
{
  "nodes": [
    {
      "name": "Daily Schedule",
      "type": "n8n-nodes-base.scheduleTrigger"
    },
    {
      "name": "Fetch Commits",
      "type": "n8n-nodes-base.github",
      "parameters": {
        "operation": "getCommits",
        "since": "={{ $now.minus({days: 1}).toISO() }}"
      }
    },
    {
      "name": "Calculate Metrics",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const commits = items;\nconst aiCommits = commits.filter(c => c.json.commit.message.includes('Claude'));\nconst metrics = {\n  totalCommits: commits.length,\n  aiCommits: aiCommits.length,\n  filesChanged: aiCommits.reduce((sum, c) => sum + (c.json.files?.length || 0), 0),\n  productivity: (aiCommits.length / commits.length * 100).toFixed(1)\n};\n\nreturn [{json: metrics}];"
      }
    },
    {
      "name": "Store in Database",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "insert",
        "table": "ai_metrics",
        "columns": "date,total_commits,ai_commits,files_changed,productivity",
        "values": "{{ $now.toISODate() }},{{ $json.totalCommits }},{{ $json.aiCommits }},{{ $json.filesChanged }},{{ $json.productivity }}"
      }
    },
    {
      "name": "Send Weekly Summary",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $now.weekdayLong }}",
              "operation": "equal",
              "value2": "Monday"
            }
          ]
        }
      }
    }
  ]
}
```

---

## 🔗 Connecting Both Systems

### Step 1: GitHub Webhook Setup in N8N

1. In N8N, create workflow with GitHub Trigger
2. Copy webhook URL from N8N
3. Go to GitHub → Settings → Webhooks
4. Add webhook with N8N URL
5. Select events: `push`, `pull_request`
6. Save webhook

### Step 2: Environment Variables

Create `.env` in N8N:
```bash
# GitHub
GITHUB_TOKEN=your_github_token
GITHUB_REPO_OWNER=your_username
GITHUB_REPO_NAME=your_repo

# Notifications
SLACK_WEBHOOK_URL=your_slack_webhook
EMAIL_RECIPIENT=your_email@example.com

# Deployment
VERCEL_TOKEN=your_vercel_token
DEPLOYMENT_URL=your_app_url

# Database (for metrics)
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=ai_metrics
```

### Step 3: Import Workflows

1. Download workflows from `/n8n-workflows/` directory
2. In N8N, click "Import from File"
3. Select each workflow JSON
4. Update credentials and settings
5. Activate workflows

---

## 🎯 Use Cases

### Use Case 1: Complete Automation

**Flow:**
```
Claude Agent completes task
    ↓
Pushes to GitHub
    ↓
N8N detects push
    ↓
Runs automated tests
    ↓
If tests pass → Deploy to staging
    ↓
Notify team on Slack
    ↓
After review → Deploy to production
```

### Use Case 2: Team Coordination

**Flow:**
```
Multiple Claude agents working
    ↓
Each pushes to separate branches
    ↓
N8N tracks all branches
    ↓
Generates daily summary
    ↓
Sends team email with:
- Tasks completed
- Code changes
- Test results
- Deployment status
```

### Use Case 3: Quality Assurance

**Flow:**
```
Claude agent pushes code
    ↓
N8N triggers:
- Linting
- Type checking
- Unit tests
- Integration tests
- Security scan
    ↓
All results compiled
    ↓
Pass: Auto-merge to main
Fail: Create GitHub issue
```

---

## 📈 Benefits of Integration

### Productivity Gains

**Before Integration:**
- Manual testing
- Manual deployment
- Manual notifications
- Manual tracking
- **Total: 2-3 hours/day**

**After Integration:**
- Automated testing (N8N)
- Automated deployment (N8N)
- Automated notifications (N8N)
- Automated tracking (N8N)
- **Total: 5 minutes/day**

**Time Saved:** 95%+

### Additional Benefits

✅ **Consistency:** Same process every time
✅ **Reliability:** Automated testing catches issues
✅ **Visibility:** Team always knows status
✅ **Speed:** Deployments happen immediately
✅ **Metrics:** Track AI agent productivity
✅ **Scale:** Handle 10x more tasks

---

## 🚀 Getting Started

### Quick Integration (30 minutes)

1. **Install N8N:**
   ```bash
   npx n8n
   # Or: docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
   ```

2. **Import Base Workflow:**
   - Use GitHub webhook template above
   - Update with your repository

3. **Test Integration:**
   - Make a commit from Claude Code for Web
   - Verify N8N receives webhook
   - Check notification sent

4. **Expand:**
   - Add more workflows as needed
   - Customize for your process

---

## 📚 Additional Resources

- **N8N Documentation:** [docs.n8n.io](https://docs.n8n.io)
- **GitHub Webhooks:** [docs.github.com/webhooks](https://docs.github.com/webhooks)
- **Example Workflows:** `/n8n-workflows/` directory

---

## 🎉 Result

**Combined Power:**
- Claude Code for Web: AI development
- N8N: Automation and orchestration
- Result: Fully automated development pipeline

**Your productivity just went to 11! 🚀**

---

*For support with integration, see main README or create GitHub issue.*
