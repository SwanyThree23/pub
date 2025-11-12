# N8N Workflows Setup Guide

> **Automated YouTube content cloning with legal compliance and cost optimization**

---

## 📋 Overview

This directory contains three N8N workflows that automate the entire YouTube channel cloning pipeline:

1. **youtube-content-extraction.json** - Extract and prepare YouTube content for NotebookLM
2. **content-generation.json** - Generate transformative content with Fair Use checks
3. **multi-platform-distribution.json** - Distribute content across multiple platforms

---

## 🚀 Quick Start

### Prerequisites

```yaml
required_tools:
  - N8N (self-hosted or cloud)
  - MongoDB (for data storage)
  - Redis (for caching - optional but recommended)
  - Claude API key (Anthropic)
  - NotebookLM account (Google)
  - Grabbit Chrome extension
  - NotebookLM Web Sync Chrome extension

platform_api_keys:
  optional:
    - Twitter API credentials
    - LinkedIn API credentials
    - Blog/CMS API credentials
    - Medium API credentials
```

### Installation Steps

**Step 1: Import Workflows to N8N**

```bash
# Method 1: Via N8N UI
1. Open N8N dashboard
2. Click "Workflows" → "Import from File"
3. Select each JSON file:
   - youtube-content-extraction.json
   - content-generation.json
   - multi-platform-distribution.json

# Method 2: Via N8N CLI
n8n import:workflow --input=./youtube-content-extraction.json
n8n import:workflow --input=./content-generation.json
n8n import:workflow --input=./multi-platform-distribution.json
```

**Step 2: Configure Environment Variables**

```bash
# Add to your .env file or N8N environment settings

# Core APIs
ANTHROPIC_API_KEY=your_claude_api_key_here
MONGO_URI=mongodb://localhost:27017/youtube_clone
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Platform APIs (optional)
TWITTER_BEARER_TOKEN=your_twitter_token
LINKEDIN_ACCESS_TOKEN=your_linkedin_token
LINKEDIN_PERSON_URN=your_linkedin_urn
BLOG_API_ENDPOINT=https://your-blog.com/api
BLOG_API_KEY=your_blog_api_key

# Notification
NOTIFICATION_EMAIL=your-email@example.com
```

**Step 3: Activate Workflows**

```bash
# In N8N UI:
1. Open each workflow
2. Click "Active" toggle in top right
3. Verify webhook URLs are generated
4. Save webhook URLs for API calls
```

---

## 📊 Workflow Details

### Workflow 1: YouTube Content Extraction

**Purpose:** Extract YouTube video metadata and prepare for NotebookLM import

**Webhook:** `POST /webhook/youtube-extract`

**Request Body:**
```json
{
  "urls": [
    "https://youtube.com/watch?v=abc123",
    "https://youtube.com/watch?v=def456"
  ],
  "notebook_id": "your_notebooklm_notebook_id",
  "user_email": "your-email@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Video extraction complete",
  "video_title": "Extracted Video Title",
  "status": "awaiting_manual_import",
  "next_steps": {
    "step_1": "Use Grabbit Chrome extension to collect video URLs",
    "step_2": "Open NotebookLM and navigate to notebook",
    "step_3": "Use NotebookLM Web Sync extension to import content",
    "step_4": "Wait for NotebookLM to process",
    "step_5": "Webhook will be called when ready"
  }
}
```

**What it does:**
1. Receives YouTube URLs
2. Fetches video metadata (title, channel, description, etc.)
3. Stores metadata in database
4. Sends email notification with import instructions
5. Waits for NotebookLM processing to complete

**Cost:** $0 (no API calls, just metadata extraction)

---

### Workflow 2: Content Generation

**Purpose:** Generate transformative content with Fair Use compliance checks

**Webhook:** `POST /webhook/notebooklm-ready`

**Request Body:**
```json
{
  "notebook_id": "your_notebook_id",
  "summary": "Condensed summary from NotebookLM...",
  "key_points": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ],
  "sources": [
    {
      "title": "Video Title",
      "creator": "Channel Name",
      "url": "https://youtube.com/watch?v=...",
      "platform": "YouTube"
    }
  ],
  "content_requests": [
    {
      "topic": "Best Budget Smartphones 2024",
      "format": "blog_post",
      "word_count": 1500,
      "tone": "professional",
      "audience": "tech enthusiasts",
      "target_platform": "blog",
      "transformation_plan": "Add expert analysis, comparison matrix, buying guide",
      "requires_research": true,
      "analysis_depth": "moderate"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "content_id": "generated_content_id_123",
  "word_count": 1547,
  "cost": "$0.0892",
  "compliance_score": 87.5,
  "status": "ready_for_distribution"
}
```

**What it does:**
1. Receives NotebookLM processed data
2. Runs Fair Use 4-factor compliance check
3. Builds compressed, efficient prompt
4. Selects optimal Claude model (Haiku/Sonnet/Opus)
5. Generates transformative content via Claude API
6. Adds automated attribution
7. Stores in database
8. Returns content ID for distribution

**Cost:** $0.03-$0.15 per piece (depending on complexity and model)

**Fair Use Check:**
- Factor 1 (Transformation): ≥85 for detailed transformation plan
- Factor 2 (Nature): 60-80 depending on source type
- Factor 3 (Amount): 90 for 5+ sources, 70 for 3-4, 40 for <3
- Factor 4 (Market): 85 for different platform, 60 for same

**Overall passing score:** ≥70

---

### Workflow 3: Multi-Platform Distribution

**Purpose:** Distribute content to multiple platforms with platform-specific formatting

**Webhook:** `POST /webhook/distribute-content`

**Request Body:**
```json
{
  "content_id": "generated_content_id_123",
  "platforms": ["twitter", "linkedin", "blog", "medium"]
}
```

**Response:**
```json
{
  "success": true,
  "content_id": "generated_content_id_123",
  "platforms_distributed": 4,
  "results": [
    {
      "platform": "twitter",
      "post_id": "1234567890",
      "post_url": "https://twitter.com/you/status/1234567890",
      "posted_at": "2024-01-01T12:00:00Z",
      "status": "published"
    },
    {
      "platform": "linkedin",
      "post_id": "ugc-post-123",
      "post_url": "https://linkedin.com/posts/you_123",
      "posted_at": "2024-01-01T12:00:05Z",
      "status": "published"
    }
  ],
  "message": "Content successfully distributed to all platforms"
}
```

**What it does:**
1. Fetches generated content from database
2. Verifies attribution is complete
3. Formats content for each platform:
   - **Twitter:** Splits into thread with attribution tweets
   - **LinkedIn:** Full post with professional attribution
   - **Blog:** HTML formatted with styled attribution
   - **Medium:** Long-form with inline attribution
4. Posts to each platform via APIs
5. Updates database with distribution results
6. Creates analytics tracking records

**Cost:** $0 (no API calls to paid services)

**Platform-Specific Formatting:**
- Twitter: 280 char chunks + attribution thread
- LinkedIn: Full text + structured sources section
- Blog: HTML with styled attribution component
- Medium: Markdown with embedded attribution

---

## 🔄 Complete Workflow Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                   WORKFLOW PIPELINE                          │
└─────────────────────────────────────────────────────────────┘

Step 1: Content Discovery
┌──────────────────┐
│ Find YouTube     │
│ Videos to Clone  │
└────────┬─────────┘
         │
         ▼
Step 2: Extraction
┌──────────────────┐         POST /youtube-extract
│  Workflow 1:     │◄────────{ urls: [...], notebook_id: ... }
│  YouTube         │
│  Extraction      │────────►Email notification sent
└────────┬─────────┘
         │
         ▼
Step 3: Manual NotebookLM Import (Grabbit + Web Sync)
┌──────────────────┐
│  1. Grabbit      │ Collect URLs
│  2. NotebookLM   │ Import content
│  3. Web Sync     │ Transfer data
└────────┬─────────┘
         │
         ▼
Step 4: Content Generation
┌──────────────────┐         POST /notebooklm-ready
│  Workflow 2:     │◄────────{ notebook_id, summary, sources, ... }
│  Content Gen     │
│  + Fair Use      │────────►{ content_id, cost, compliance_score }
└────────┬─────────┘
         │
         ▼
Step 5: Distribution
┌──────────────────┐         POST /distribute-content
│  Workflow 3:     │◄────────{ content_id, platforms: [...] }
│  Multi-Platform  │
│  Distribution    │────────►Posted to all platforms
└────────┬─────────┘
         │
         ▼
Step 6: Analytics & Monitoring
┌──────────────────┐
│ Track            │
│ - Views          │
│ - Engagement     │
│ - Costs          │
│ - ROI            │
└──────────────────┘
```

---

## 💡 Usage Examples

### Example 1: Clone Single Video to Blog

```bash
# Step 1: Extract video
curl -X POST http://your-n8n-instance/webhook/youtube-extract \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["https://youtube.com/watch?v=abc123"],
    "notebook_id": "my_notebook",
    "user_email": "me@example.com"
  }'

# Step 2: Import to NotebookLM manually using Grabbit + Web Sync

# Step 3: Generate content
curl -X POST http://your-n8n-instance/webhook/notebooklm-ready \
  -H "Content-Type: application/json" \
  -d '{
    "notebook_id": "my_notebook",
    "summary": "NotebookLM summary here...",
    "sources": [...],
    "content_requests": [{
      "topic": "Topic from video",
      "format": "blog_post",
      "word_count": 1500,
      "target_platform": "blog"
    }]
  }'

# Response: { "content_id": "xyz123", ... }

# Step 4: Distribute
curl -X POST http://your-n8n-instance/webhook/distribute-content \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": "xyz123",
    "platforms": ["blog"]
  }'
```

### Example 2: Clone Multiple Videos to Multiple Platforms

```bash
# Extract multiple videos
curl -X POST http://your-n8n-instance/webhook/youtube-extract \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://youtube.com/watch?v=video1",
      "https://youtube.com/watch?v=video2",
      "https://youtube.com/watch?v=video3"
    ],
    "notebook_id": "tech_reviews",
    "user_email": "me@example.com"
  }'

# After NotebookLM import, generate comprehensive content
curl -X POST http://your-n8n-instance/webhook/notebooklm-ready \
  -H "Content-Type: application/json" \
  -d '{
    "notebook_id": "tech_reviews",
    "summary": "Synthesis of 3 tech review videos...",
    "sources": [
      {"title": "Video 1", "creator": "Creator A", "url": "..."},
      {"title": "Video 2", "creator": "Creator B", "url": "..."},
      {"title": "Video 3", "creator": "Creator C", "url": "..."}
    ],
    "content_requests": [{
      "topic": "Comprehensive Tech Review 2024",
      "format": "blog_post",
      "word_count": 2500,
      "transformation_plan": "Synthesize all perspectives, add comparison matrix",
      "target_platform": "blog"
    }]
  }'

# Distribute everywhere
curl -X POST http://your-n8n-instance/webhook/distribute-content \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": "content_abc",
    "platforms": ["twitter", "linkedin", "blog", "medium"]
  }'
```

---

## 🔧 Customization

### Modify Fair Use Scoring

Edit `content-generation.json` → "Fair Use Compliance Check" node:

```javascript
// Adjust scoring thresholds
if (sources.length >= 5) {
  complianceCheck.factor_3_amount = 90;
} else if (sources.length >= 3) {
  complianceCheck.factor_3_amount = 70;  // Change this value
} else {
  complianceCheck.factor_3_amount = 40;  // Or this
}

// Adjust passing score
complianceCheck.passed = complianceCheck.overall_score >= 70;  // Change threshold
```

### Change Model Selection Logic

Edit `content-generation.json` → "Select Optimal Model" node:

```javascript
// Adjust complexity thresholds
if (complexityScore < 30) {
  selectedModel = 'claude-haiku-4-5';  // Fast & cheap
} else if (complexityScore < 70) {
  selectedModel = 'claude-sonnet-4-5-20250929';  // Balanced
} else {
  selectedModel = 'claude-opus-4';  // Deep analysis
}
```

### Add New Platform

Edit `multi-platform-distribution.json` → "Format for Platforms" node:

```javascript
case 'instagram':
  formattedContent.instagram = AttributionEngine.formatForInstagram(content, sources);
  break;
```

Then add platform posting node after "Is Blog?" node.

---

## 📊 Monitoring & Analytics

### View Workflow Executions

```bash
# In N8N UI:
1. Go to "Executions" tab
2. Filter by workflow
3. View success/failure rates
4. Check execution times
5. Review costs per execution
```

### Cost Tracking

Each execution logs:
- Model used
- Tokens consumed
- Actual cost
- Estimated vs actual

Access via database:

```javascript
db.generated_content.aggregate([
  {
    $group: {
      _id: null,
      total_cost: { $sum: '$actual_cost' },
      avg_cost: { $avg: '$actual_cost' },
      total_content: { $sum: 1 }
    }
  }
])
```

### Analytics Dashboard

Query analytics records:

```javascript
db.content_analytics.find({
  posted_at: {
    $gte: new Date('2024-01-01'),
    $lte: new Date('2024-01-31')
  }
})
```

---

## 🚨 Troubleshooting

### Workflow Fails at Claude API Call

**Problem:** API returns error

**Solutions:**
1. Check API key is valid: `echo $ANTHROPIC_API_KEY`
2. Verify rate limits not exceeded
3. Check prompt token count (max ~200k for Sonnet)
4. Review Claude API status page

### Attribution Not Adding

**Problem:** `[ATTRIBUTION_PLACEHOLDER]` still in output

**Solution:**
1. Check "Add Attribution" node executed
2. Verify sources array exists and populated
3. Review AttributionEngine logic
4. Check for JavaScript errors in node logs

### Platform Distribution Fails

**Problem:** Can't post to platform

**Solutions:**
1. Verify API credentials for platform
2. Check platform API rate limits
3. Review platform-specific content requirements
4. Check API endpoint URLs are correct

### Fair Use Check Always Fails

**Problem:** Compliance score too low

**Solutions:**
1. Add more sources (aim for 5+)
2. Strengthen transformation plan in request
3. Use different target platform than source
4. Review compliance scoring logic
5. Adjust thresholds if appropriate for use case

---

## ✅ Best Practices

1. **Test Workflows:** Test each workflow individually before chaining
2. **Monitor Costs:** Track Claude API usage daily
3. **Review Compliance:** Check Fair Use scores regularly
4. **Attribution:** Never skip attribution checks
5. **Error Handling:** Set up N8N error workflows
6. **Backups:** Export workflows regularly
7. **Version Control:** Keep workflow JSONs in git
8. **Documentation:** Document any customizations

---

## 📚 Additional Resources

- **Legal Documentation:** `../legal/COMPLIANCE-FRAMEWORK.md`
- **Cost Optimization:** `../cost-optimization/STRATEGIES.md`
- **Attribution System:** `../legal/ATTRIBUTION-SYSTEM.md`
- **DMCA Response:** `../legal/DMCA-RESPONSE.md`
- **Main README:** `../README.md`

---

## 🎯 Success Metrics

Track these metrics to measure success:

```yaml
cost_metrics:
  - Cost per content piece: Target <$0.10
  - Monthly total: Track vs baseline
  - Optimization savings: Target 60-80% reduction

quality_metrics:
  - Fair Use compliance rate: Target 95%+
  - Content regeneration rate: Target <5%
  - Attribution completeness: Target 100%

distribution_metrics:
  - Platforms reached per piece: Track count
  - Distribution success rate: Target 98%+
  - Time to distribute: Target <5 minutes

engagement_metrics:
  - Views per platform
  - Engagement rate
  - Click-through rate
  - ROI per piece
```

---

**Your automated YouTube channel cloning system is ready! Start with Workflow 1 and work through the pipeline.**

---

*Version: 1.0*
*Last Updated: 2024*
