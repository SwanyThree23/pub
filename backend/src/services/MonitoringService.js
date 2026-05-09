export class MonitoringService {
  constructor() {
    this.predictions = [];
    this.groundTruths = [];
  }

  trackPrediction(model, { input, prediction, confidence }) {
    this.predictions.push({
      model,
      input,
      prediction,
      confidence,
      timestamp: new Date()
    });
  }

  logGroundTruth(review) {
    this.groundTruths.push({
      input: review.data.message,
      actualLabel: review.decision,
      aiPrediction: review.data.aiAnalysis.toxic ? 'toxic' : 'safe',
      timestamp: new Date()
    });
  }

  async getModelMetrics(model) {
    const recent = this.predictions.filter(p => p.model === model).slice(-1000);

    return {
      totalPredictions: recent.length,
      avgConfidence: recent.reduce((sum, p) => sum + p.confidence, 0) / recent.length,
      lowConfidenceRate: recent.filter(p => p.confidence < 0.8).length / recent.length,
      accuracy: this.calculateAccuracy(model),
      driftDetected: this.detectDrift(recent)
    };
  }

  calculateAccuracy(model) {
    const matched = this.groundTruths.filter(gt => {
      const pred = this.predictions.find(p => p.input === gt.input);
      return pred && (pred.prediction ? 'toxic' : 'safe') === gt.actualLabel;
    });

    return matched.length / (this.groundTruths.length || 1);
  }

  detectDrift(predictions) {
    const recent = predictions.slice(-100);
    const older = predictions.slice(-200, -100);

    if (recent.length < 50 || older.length < 50) return false;

    const recentAvg = recent.reduce((s, p) => s + p.confidence, 0) / recent.length;
    const olderAvg = older.reduce((s, p) => s + p.confidence, 0) / older.length;

    return recentAvg < olderAvg * 0.9; // 10% drop = drift detected
  }

  trackEvent(eventName, data) {
    console.log(`📊 Event: ${eventName}`, data);
  }
}
