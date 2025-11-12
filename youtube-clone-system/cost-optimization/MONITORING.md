# Cost Monitoring & Tracking

> **Track API costs in real-time and optimize spending**

---

## 📊 Overview

Effective cost monitoring helps you:
- Track spending in real-time
- Identify cost spikes quickly
- Measure optimization effectiveness
- Predict future costs
- Make data-driven decisions

---

## 🎯 Key Metrics to Track

```yaml
essential_metrics:

  cost_metrics:
    - total_monthly_cost
    - cost_per_content_piece
    - cost_per_1000_tokens
    - cost_by_model
    - cost_by_content_type

  efficiency_metrics:
    - tokens_per_content_piece
    - cache_hit_rate
    - prompt_compression_rate
    - batch_processing_rate

  quality_metrics:
    - content_quality_score
    - regeneration_rate
    - user_satisfaction
    - cost_per_quality_point

  savings_metrics:
    - savings_vs_baseline
    - optimization_roi
    - savings_by_strategy
```

---

## 🔧 Implementation

### Cost Tracking System

```javascript
/**
 * Comprehensive Cost Tracking System
 * Monitor all API usage and costs in real-time
 */

const { MongoClient } = require('mongodb');

class CostTracker {
  constructor(mongoUri, dbName) {
    this.client = new MongoClient(mongoUri);
    this.dbName = dbName;
    this.db = null;

    // Model pricing (per 1M tokens)
    this.pricing = {
      'claude-haiku-4-5': { input: 1.00, output: 5.00 },
      'claude-sonnet-4-5-20250929': { input: 3.00, output: 15.00 },
      'claude-opus-4': { input: 15.00, output: 75.00 }
    };
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db(this.dbName);
  }

  /**
   * Log API request and calculate cost
   */
  async logRequest(requestData) {
    const cost = this.calculateCost(
      requestData.model,
      requestData.usage.input_tokens,
      requestData.usage.output_tokens
    );

    const record = {
      timestamp: new Date(),
      request_id: requestData.request_id,
      model: requestData.model,
      usage: requestData.usage,
      cost: cost,
      content_type: requestData.content_type,
      cache_hit: requestData.cache_hit || false,
      batch_processed: requestData.batch_processed || false,
      optimization_flags: {
        prompt_compressed: requestData.prompt_compressed || false,
        cached_result: requestData.cache_hit || false,
        batched: requestData.batch_processed || false,
        preprocessed: requestData.preprocessed || false
      }
    };

    await this.db.collection('api_usage').insertOne(record);

    // Update running totals
    await this.updateDailyTotals(record);

    return record;
  }

  calculateCost(model, inputTokens, outputTokens) {
    const pricing = this.pricing[model];

    if (!pricing) {
      throw new Error(`Unknown model: ${model}`);
    }

    const inputCost = (inputTokens / 1000000) * pricing.input;
    const outputCost = (outputTokens / 1000000) * pricing.output;

    return {
      input_cost: inputCost,
      output_cost: outputCost,
      total_cost: inputCost + outputCost,
      breakdown: {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        input_rate: pricing.input,
        output_rate: pricing.output
      }
    };
  }

  async updateDailyTotals(record) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    await this.db.collection('daily_totals').updateOne(
      { date: date },
      {
        $inc: {
          total_requests: 1,
          total_cost: record.cost.total_cost,
          total_input_tokens: record.usage.input_tokens,
          total_output_tokens: record.usage.output_tokens
        },
        $setOnInsert: { date: date }
      },
      { upsert: true }
    );
  }

  /**
   * Get current month's costs
   */
  async getMonthlyReport(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const requests = await this.db.collection('api_usage')
      .find({
        timestamp: { $gte: startDate, $lte: endDate }
      })
      .toArray();

    return this.generateReport(requests, 'month');
  }

  /**
   * Generate comprehensive cost report
   */
  generateReport(requests, period) {
    const report = {
      period: period,
      summary: {
        total_requests: requests.length,
        total_cost: 0,
        total_tokens: 0,
        avg_cost_per_request: 0
      },
      by_model: {},
      by_content_type: {},
      optimization_impact: {
        caching: { requests: 0, savings: 0 },
        batching: { requests: 0, savings: 0 },
        compression: { requests: 0, savings: 0 },
        preprocessing: { requests: 0, savings: 0 }
      },
      trends: [],
      recommendations: []
    };

    // Calculate totals
    requests.forEach(req => {
      report.summary.total_cost += req.cost.total_cost;
      report.summary.total_tokens +=
        req.usage.input_tokens + req.usage.output_tokens;

      // By model
      if (!report.by_model[req.model]) {
        report.by_model[req.model] = { requests: 0, cost: 0 };
      }
      report.by_model[req.model].requests++;
      report.by_model[req.model].cost += req.cost.total_cost;

      // By content type
      if (!report.by_content_type[req.content_type]) {
        report.by_content_type[req.content_type] = { requests: 0, cost: 0 };
      }
      report.by_content_type[req.content_type].requests++;
      report.by_content_type[req.content_type].cost += req.cost.total_cost;

      // Optimization impact
      if (req.cache_hit) {
        report.optimization_impact.caching.requests++;
        // Estimate savings (actual request cost vs what it would have been)
        report.optimization_impact.caching.savings += req.cost.total_cost;
      }

      if (req.batch_processed) {
        report.optimization_impact.batching.requests++;
        // Estimate ~20% savings from batching
        report.optimization_impact.batching.savings += req.cost.total_cost * 0.2;
      }
    });

    // Calculate averages
    report.summary.avg_cost_per_request =
      report.summary.total_cost / report.summary.total_requests;

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report);

    return report;
  }

  generateRecommendations(report) {
    const recommendations = [];

    // Check if expensive model is overused
    const opusCost = report.by_model['claude-opus-4']?.cost || 0;
    const totalCost = report.summary.total_cost;

    if (opusCost / totalCost > 0.5) {
      recommendations.push({
        priority: 'high',
        category: 'model_selection',
        issue: 'Opus model usage high (>50% of costs)',
        action: 'Review model routing logic - can simpler tasks use Haiku or Sonnet?',
        potential_savings: (opusCost * 0.5).toFixed(2)
      });
    }

    // Check cache hit rate
    const cacheRequests = report.optimization_impact.caching.requests;
    const cacheHitRate = cacheRequests / report.summary.total_requests;

    if (cacheHitRate < 0.3) {
      recommendations.push({
        priority: 'medium',
        category: 'caching',
        issue: `Low cache hit rate: ${(cacheHitRate * 100).toFixed(1)}%`,
        action: 'Review caching strategy - increase TTL or expand cache coverage',
        potential_savings: (report.summary.total_cost * 0.2).toFixed(2)
      });
    }

    // Check if batch processing could be improved
    const batchRequests = report.optimization_impact.batching.requests;
    const batchRate = batchRequests / report.summary.total_requests;

    if (batchRate < 0.5) {
      recommendations.push({
        priority: 'medium',
        category: 'batching',
        issue: `Low batch processing rate: ${(batchRate * 100).toFixed(1)}%`,
        action: 'Increase batch size or batch more request types',
        potential_savings: (report.summary.total_cost * 0.15).toFixed(2)
      });
    }

    return recommendations;
  }

  /**
   * Real-time cost alert system
   */
  async checkCostAlerts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCost = await this.db.collection('daily_totals')
      .findOne({ date: today });

    if (!todayCost) return null;

    const alerts = [];

    // Daily budget alert
    const dailyBudget = 10; // $10/day
    if (todayCost.total_cost > dailyBudget) {
      alerts.push({
        severity: 'high',
        type: 'budget_exceeded',
        message: `Daily budget exceeded: $${todayCost.total_cost.toFixed(2)} > $${dailyBudget}`,
        action: 'Review recent requests for anomalies'
      });
    }

    // Spike detection
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayCost = await this.db.collection('daily_totals')
      .findOne({ date: yesterday });

    if (yesterdayCost && todayCost.total_cost > yesterdayCost.total_cost * 2) {
      alerts.push({
        severity: 'medium',
        type: 'cost_spike',
        message: `Cost spike detected: ${((todayCost.total_cost / yesterdayCost.total_cost - 1) * 100).toFixed(0)}% increase`,
        action: 'Investigate cause of increased usage'
      });
    }

    return alerts.length > 0 ? alerts : null;
  }

  /**
   * Projection: Estimate month-end costs
   */
  async projectMonthEndCost() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const daysInMonth = endOfMonth.getDate();
    const daysSoFar = now.getDate();

    const monthToDateCost = await this.db.collection('daily_totals')
      .aggregate([
        {
          $match: {
            date: { $gte: startOfMonth, $lte: now }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total_cost' }
          }
        }
      ])
      .toArray();

    const currentTotal = monthToDateCost[0]?.total || 0;
    const avgPerDay = currentTotal / daysSoFar;
    const projectedMonthEnd = avgPerDay * daysInMonth;

    return {
      current_month_to_date: currentTotal.toFixed(2),
      days_elapsed: daysSoFar,
      days_remaining: daysInMonth - daysSoFar,
      avg_cost_per_day: avgPerDay.toFixed(2),
      projected_month_end: projectedMonthEnd.toFixed(2),
      projection_confidence: this.calculateProjectionConfidence(daysSoFar, daysInMonth)
    };
  }

  calculateProjectionConfidence(daysSoFar, daysInMonth) {
    const percentComplete = daysSoFar / daysInMonth;

    if (percentComplete >= 0.8) return 'high';
    if (percentComplete >= 0.5) return 'medium';
    return 'low';
  }
}

// Export for use
module.exports = CostTracker;
```

### Usage Example

```javascript
const CostTracker = require('./cost-tracker');

// Initialize tracker
const tracker = new CostTracker(
  process.env.MONGO_URI,
  'cost_tracking'
);

await tracker.connect();

// Log API request
const requestData = {
  request_id: 'req_123',
  model: 'claude-sonnet-4-5-20250929',
  usage: {
    input_tokens: 1500,
    output_tokens: 2000
  },
  content_type: 'blog_post',
  cache_hit: false,
  batch_processed: true,
  prompt_compressed: true
};

await tracker.logRequest(requestData);

// Check for alerts
const alerts = await tracker.checkCostAlerts();
if (alerts) {
  console.log('⚠️ Cost Alerts:', alerts);
}

// Get monthly report
const report = await tracker.getMonthlyReport(2024, 11);
console.log('Monthly Report:', report);

// Project month-end costs
const projection = await tracker.projectMonthEndCost();
console.log('Projected month-end cost:', projection.projected_month_end);
```

---

## 📈 Dashboard Implementation

### Real-Time Cost Dashboard

```javascript
/**
 * Real-time cost monitoring dashboard
 * Provides live view of spending and optimization
 */

const express = require('express');
const app = express();

class CostDashboard {
  constructor(costTracker) {
    this.tracker = costTracker;
    this.setupRoutes();
  }

  setupRoutes() {
    // Main dashboard
    app.get('/dashboard', async (req, res) => {
      const data = await this.getDashboardData();
      res.json(data);
    });

    // Real-time metrics
    app.get('/metrics/realtime', async (req, res) => {
      const metrics = await this.getRealTimeMetrics();
      res.json(metrics);
    });

    // Cost projection
    app.get('/projection', async (req, res) => {
      const projection = await this.tracker.projectMonthEndCost();
      res.json(projection);
    });

    // Optimization insights
    app.get('/insights', async (req, res) => {
      const insights = await this.getOptimizationInsights();
      res.json(insights);
    });
  }

  async getDashboardData() {
    const now = new Date();

    return {
      current_metrics: await this.getRealTimeMetrics(),
      monthly_summary: await this.tracker.getMonthlyReport(
        now.getFullYear(),
        now.getMonth() + 1
      ),
      projection: await this.tracker.projectMonthEndCost(),
      alerts: await this.tracker.checkCostAlerts(),
      optimization_status: await this.getOptimizationStatus(),
      trends: await this.getTrends()
    };
  }

  async getRealTimeMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayData = await this.tracker.db.collection('daily_totals')
      .findOne({ date: today });

    return {
      today_cost: todayData?.total_cost.toFixed(2) || '0.00',
      today_requests: todayData?.total_requests || 0,
      today_tokens: todayData?.total_input_tokens + todayData?.total_output_tokens || 0,
      avg_cost_per_request: todayData ?
        (todayData.total_cost / todayData.total_requests).toFixed(4) : '0.00'
    };
  }

  async getOptimizationStatus() {
    // Get recent requests (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentRequests = await this.tracker.db.collection('api_usage')
      .find({
        timestamp: { $gte: oneDayAgo }
      })
      .toArray();

    const total = recentRequests.length;
    const cached = recentRequests.filter(r => r.cache_hit).length;
    const batched = recentRequests.filter(r => r.batch_processed).length;
    const compressed = recentRequests.filter(
      r => r.optimization_flags?.prompt_compressed
    ).length;

    return {
      cache_hit_rate: ((cached / total) * 100).toFixed(1) + '%',
      batch_rate: ((batched / total) * 100).toFixed(1) + '%',
      compression_rate: ((compressed / total) * 100).toFixed(1) + '%',
      total_requests: total,
      optimization_score: this.calculateOptimizationScore({
        cache: cached / total,
        batch: batched / total,
        compress: compressed / total
      })
    };
  }

  calculateOptimizationScore(rates) {
    // Weighted score (0-100)
    const weights = { cache: 0.4, batch: 0.3, compress: 0.3 };

    const score =
      (rates.cache * weights.cache * 100) +
      (rates.batch * weights.batch * 100) +
      (rates.compress * weights.compress * 100);

    return score.toFixed(0);
  }

  async getTrends() {
    // Last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const dailyData = await this.tracker.db.collection('daily_totals')
      .find({
        date: { $gte: sevenDaysAgo }
      })
      .sort({ date: 1 })
      .toArray();

    return dailyData.map(d => ({
      date: d.date.toISOString().split('T')[0],
      cost: d.total_cost.toFixed(2),
      requests: d.total_requests,
      avg_cost: (d.total_cost / d.total_requests).toFixed(4)
    }));
  }

  start(port = 3000) {
    app.listen(port, () => {
      console.log(`Cost Dashboard running on http://localhost:${port}/dashboard`);
    });
  }
}

// Usage
const dashboard = new CostDashboard(tracker);
dashboard.start(3000);
```

### Dashboard Frontend (HTML + Chart.js)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Cost Monitoring Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f7fa;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .metric-value {
      font-size: 2em;
      font-weight: bold;
      color: #667eea;
    }

    .metric-label {
      color: #666;
      margin-top: 5px;
    }

    .chart-container {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .alert {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 5px;
    }

    .alert.high {
      background: #f8d7da;
      border-left-color: #dc3545;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Cost Monitoring Dashboard</h1>
      <p>Real-time API cost tracking and optimization insights</p>
    </div>

    <div id="alerts"></div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value" id="today-cost">$0.00</div>
        <div class="metric-label">Today's Cost</div>
      </div>

      <div class="metric-card">
        <div class="metric-value" id="projected-cost">$0.00</div>
        <div class="metric-label">Projected Month-End</div>
      </div>

      <div class="metric-card">
        <div class="metric-value" id="cache-rate">0%</div>
        <div class="metric-label">Cache Hit Rate</div>
      </div>

      <div class="metric-card">
        <div class="metric-value" id="optimization-score">0</div>
        <div class="metric-label">Optimization Score</div>
      </div>
    </div>

    <div class="chart-container">
      <h3>7-Day Cost Trend</h3>
      <canvas id="costChart"></canvas>
    </div>

    <div class="chart-container">
      <h3>Cost by Model</h3>
      <canvas id="modelChart"></canvas>
    </div>
  </div>

  <script>
    // Fetch dashboard data
    async function loadDashboard() {
      const response = await fetch('/dashboard');
      const data = await response.json();

      // Update metrics
      document.getElementById('today-cost').textContent =
        '$' + data.current_metrics.today_cost;
      document.getElementById('projected-cost').textContent =
        '$' + data.projection.projected_month_end;
      document.getElementById('cache-rate').textContent =
        data.optimization_status.cache_hit_rate;
      document.getElementById('optimization-score').textContent =
        data.optimization_status.optimization_score;

      // Display alerts
      if (data.alerts && data.alerts.length > 0) {
        const alertsHtml = data.alerts.map(alert => `
          <div class="alert ${alert.severity}">
            <strong>${alert.type}:</strong> ${alert.message}
            <br><em>Action: ${alert.action}</em>
          </div>
        `).join('');
        document.getElementById('alerts').innerHTML = alertsHtml;
      }

      // Render charts
      renderCostTrend(data.trends);
      renderModelBreakdown(data.monthly_summary.by_model);
    }

    function renderCostTrend(trends) {
      const ctx = document.getElementById('costChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: trends.map(t => t.date),
          datasets: [{
            label: 'Daily Cost',
            data: trends.map(t => parseFloat(t.cost)),
            borderColor: '#667eea',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          }
        }
      });
    }

    function renderModelBreakdown(byModel) {
      const ctx = document.getElementById('modelChart').getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(byModel),
          datasets: [{
            data: Object.values(byModel).map(m => m.cost),
            backgroundColor: ['#667eea', '#764ba2', '#f093fb']
          }]
        },
        options: {
          responsive: true
        }
      });
    }

    // Load dashboard on page load
    loadDashboard();

    // Refresh every 30 seconds
    setInterval(loadDashboard, 30000);
  </script>
</body>
</html>
```

---

## 🚨 Alert System

### Automated Cost Alerts

```javascript
/**
 * Alert system for cost anomalies
 * Sends notifications when thresholds are exceeded
 */

class CostAlertSystem {
  constructor(costTracker, notificationService) {
    this.tracker = costTracker;
    this.notifications = notificationService;

    this.thresholds = {
      daily_budget: 10,      // $10/day
      spike_percentage: 150, // 150% increase = 1.5x
      low_cache_rate: 0.3,   // < 30% cache hits
      high_opus_usage: 0.5   // > 50% of costs from Opus
    };
  }

  async checkAllAlerts() {
    const alerts = [];

    alerts.push(...await this.checkBudgetAlerts());
    alerts.push(...await this.checkSpikeAlerts());
    alerts.push(...await this.checkOptimizationAlerts());

    // Send notifications for any alerts
    for (const alert of alerts) {
      await this.sendAlert(alert);
    }

    return alerts;
  }

  async checkBudgetAlerts() {
    const alerts = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCost = await this.tracker.db.collection('daily_totals')
      .findOne({ date: today });

    if (todayCost && todayCost.total_cost > this.thresholds.daily_budget) {
      alerts.push({
        type: 'budget_exceeded',
        severity: 'high',
        message: `Daily budget exceeded: $${todayCost.total_cost.toFixed(2)}`,
        threshold: this.thresholds.daily_budget,
        actual: todayCost.total_cost,
        action: 'Review recent API usage for anomalies'
      });
    }

    return alerts;
  }

  async checkSpikeAlerts() {
    const alerts = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCost = await this.tracker.db.collection('daily_totals')
      .findOne({ date: today });

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayCost = await this.tracker.db.collection('daily_totals')
      .findOne({ date: yesterday });

    if (todayCost && yesterdayCost) {
      const increase = todayCost.total_cost / yesterdayCost.total_cost;

      if (increase > (this.thresholds.spike_percentage / 100)) {
        alerts.push({
          type: 'cost_spike',
          severity: 'medium',
          message: `Cost spike: ${((increase - 1) * 100).toFixed(0)}% increase`,
          yesterday: yesterdayCost.total_cost,
          today: todayCost.total_cost,
          action: 'Investigate cause of increased usage'
        });
      }
    }

    return alerts;
  }

  async checkOptimizationAlerts() {
    const alerts = [];
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentRequests = await this.tracker.db.collection('api_usage')
      .find({ timestamp: { $gte: oneDayAgo } })
      .toArray();

    // Check cache hit rate
    const cached = recentRequests.filter(r => r.cache_hit).length;
    const cacheRate = cached / recentRequests.length;

    if (cacheRate < this.thresholds.low_cache_rate) {
      alerts.push({
        type: 'low_cache_rate',
        severity: 'medium',
        message: `Low cache hit rate: ${(cacheRate * 100).toFixed(1)}%`,
        threshold: this.thresholds.low_cache_rate,
        actual: cacheRate,
        action: 'Review caching strategy'
      });
    }

    return alerts;
  }

  async sendAlert(alert) {
    // Send email/Slack/SMS notification
    await this.notifications.send({
      channel: alert.severity === 'high' ? 'urgent' : 'normal',
      title: `Cost Alert: ${alert.type}`,
      message: alert.message,
      details: alert,
      timestamp: new Date()
    });

    // Log alert
    await this.tracker.db.collection('alerts').insertOne({
      ...alert,
      timestamp: new Date(),
      acknowledged: false
    });
  }
}

// Run alerts every hour
const alertSystem = new CostAlertSystem(tracker, notificationService);

setInterval(async () => {
  await alertSystem.checkAllAlerts();
}, 60 * 60 * 1000); // Every hour
```

---

## 📊 Reporting

### Monthly Cost Report

```javascript
/**
 * Generate comprehensive monthly cost report
 */

class MonthlyReportGenerator {
  constructor(costTracker) {
    this.tracker = costTracker;
  }

  async generate(year, month) {
    const report = await this.tracker.getMonthlyReport(year, month);

    // Add visualizations
    report.charts = {
      cost_by_day: await this.generateDailyCostChart(year, month),
      cost_by_model: await this.generateModelPieChart(report.by_model),
      optimization_impact: await this.generateOptimizationChart(report)
    };

    // Add executive summary
    report.executive_summary = this.generateExecutiveSummary(report);

    // Add action items
    report.action_items = this.generateActionItems(report);

    return report;
  }

  generateExecutiveSummary(report) {
    const baseline = 350; // $350 without optimization

    const savings = baseline - report.summary.total_cost;
    const savingsPercentage = (savings / baseline) * 100;

    return {
      total_spent: `$${report.summary.total_cost.toFixed(2)}`,
      vs_baseline: `$${savings.toFixed(2)} saved (${savingsPercentage.toFixed(0)}%)`,
      requests_processed: report.summary.total_requests,
      avg_cost_per_request: `$${report.summary.avg_cost_per_request.toFixed(4)}`,
      optimization_score: this.calculateOverallOptimizationScore(report),
      top_cost_driver: this.identifyTopCostDriver(report),
      biggest_opportunity: this.identifyBiggestOpportunity(report)
    };
  }

  generateActionItems(report) {
    const items = [];

    // From recommendations
    report.recommendations.forEach(rec => {
      items.push({
        priority: rec.priority,
        category: rec.category,
        action: rec.action,
        impact: `$${rec.potential_savings} potential savings`
      });
    });

    return items;
  }
}

// Generate report
const reportGen = new MonthlyReportGenerator(tracker);
const report = await reportGen.generate(2024, 11);

console.log('Monthly Report:', report);
```

---

## ✅ Best Practices

1. **Monitor Daily**: Check costs every day
2. **Set Budgets**: Define daily/monthly limits
3. **Enable Alerts**: Get notified of anomalies
4. **Track Trends**: Identify patterns over time
5. **Review Monthly**: Deep dive every month
6. **Optimize Continuously**: Act on insights
7. **Document Changes**: Track optimization impact

---

**Next Steps:**
1. Implement tracking system
2. Set up dashboard
3. Configure alerts
4. Review daily
5. Optimize based on insights

---

*Version: 1.0*
