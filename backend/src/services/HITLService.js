export class HITLService {
  constructor() {
    this.reviewQueue = new Map();
  }

  async requestHumanReview({ type, data, priority = 'normal' }) {
    const reviewId = `review_${Date.now()}`;

    const reviewTask = {
      id: reviewId,
      type,
      data,
      priority,
      status: 'pending',
      createdAt: new Date(),
      resolver: null
    };

    this.reviewQueue.set(reviewId, reviewTask);

    // Return promise that resolves when human reviews
    return new Promise((resolve) => {
      reviewTask.resolver = resolve;
    });
  }

  async submitReview({ reviewId, reviewerId, decision, feedback }) {
    const task = this.reviewQueue.get(reviewId);
    if (!task) throw new Error('Review not found');

    task.status = 'completed';
    task.decision = decision;
    task.feedback = feedback;
    task.reviewedBy = reviewerId;
    task.reviewedAt = new Date();

    // Resolve waiting promise with human decision
    if (task.resolver) {
      task.resolver({
        ...task.data.aiAnalysis,
        toxic: decision === 'toxic',
        humanReviewed: true,
        reviewerFeedback: feedback
      });
    }

    this.reviewQueue.delete(reviewId);
    return task;
  }

  async getReviewQueue(reviewerId) {
    return Array.from(this.reviewQueue.values())
      .filter(task => task.status === 'pending')
      .sort((a, b) => {
        if (a.priority === 'high') return -1;
        if (b.priority === 'high') return 1;
        return a.createdAt - b.createdAt;
      });
  }
}
