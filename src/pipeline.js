/**
 * ContentPipeline - A content production pipeline with stages, dependencies,
 * quality gates, and priority ordering.
 *
 * Implement all methods below according to the README specifications.
 */
class ContentPipeline {
  constructor() {
    // TODO: Initialize your data structures
    this.stages = new Map();
    this.contents = new Map();
    this._idCounter = 1;
  }

  /**
   * Register a production stage.
   * @param {string} name - Stage name (e.g., 'concept', 'script', 'production')
   * @param {Object} [options]
   * @param {string[]} [options.dependsOn] - Stages that must complete before this one
   * @param {Function} [options.qualityCheck] - (content) => { passed: boolean, reason?: string }
   * @returns {void}
   * @throws {Error} If stage name already exists
   */
  addStage(name, options = {}) {
    if(this.stages.has(name)){
      throw new Error(`Stage '${name}' already exists`);
    }

    const {dependsOn = [], qualityCheck = null} = options;
    this.stages.set(name, {
      dependsOn:[...dependsOn],
      qualityCheck: typeof qualityCheck === "function" ? qualityCheck: null
    });
  }

  /**
   * Submit content into the pipeline.
   * @param {Object} content - Must have { title, type }. May have metadata.
   * @param {Object} [options]
   * @param {number} [options.priority=0] - Higher = processed first
   * @returns {string} Auto-generated contentId
   * @throws {Error} If content is missing required fields (title, type)
   */
  submit(content, options = {}) {
    if(!content || !content.title || !content.type){
      throw new Error("Content must include {title,type}");
    }
    const contentId = `c${this._idCounter++}`;
    const priority = options.priority ?? 0;
    this.contents.set(contentId,{content, priority,completedStages: new Set(), failed: false, failureReason: null, createdAt: Date.now()});
    return contentId;
  }

  /**
   * Advance content to its next available stage.
   * Picks the first pending stage whose dependencies are all completed.
   * Runs the stage's qualityCheck if one exists.
   * @param {string} contentId
   * @returns {Object} { stage, status: 'stage_complete' | 'failed', reason? }
   * @throws {Error} If contentId doesn't exist
   * @throws {Error} If content is already completed or failed
   * @throws {Error} If no stages are available (unresolvable dependencies)
   */
  advance(contentId) {
    const item = this.contents.get(contentId);
    if (!item) throw new Error(`Content '${contentId}' not found`);

    if (item.failed) {
      throw new Error(`Content '${contentId}' has already failed`);
    }

    const allStages = [...this.stages.keys()];

    if (item.completedStages.size === allStages.length) {
      throw new Error(`Content '${contentId}' is already completed`);
    }

    const pendingStages = allStages.filter(
      s => !item.completedStages.has(s)
    );

    let nextStage = null;

    for (const stageName of pendingStages) {
      const { dependsOn } = this.stages.get(stageName);
      const ready = dependsOn.every(dep => item.completedStages.has(dep));

      if (ready) {
        nextStage = stageName;
        break;
      }
    }

    if (!nextStage) {
      throw new Error(
        `No resolvable stages available for '${contentId}' (dependency deadlock)`
      );
    }

    const { qualityCheck } = this.stages.get(nextStage);

    if (qualityCheck) {
      const result = qualityCheck(item.content);

      if (!result || !result.passed) {
        item.failed = true;
        item.failureReason = result?.reason || "Quality check failed";
        return {
          stage: nextStage,
          status: "failed",
          reason: item.failureReason
        };
      }
    }

    item.completedStages.add(nextStage);

    return {
      stage: nextStage,
      status: "stage_complete"
    };
  }

  /**
   * Get the full status of a content item.
   * @param {string} contentId
   * @returns {Object} { contentId, currentStage, completedStages, pendingStages, status, failReason }
   *   status: 'queued' | 'in_progress' | 'completed' | 'failed'
   * @throws {Error} If contentId doesn't exist
   */
  getStatus(contentId) {
     const item = this.contents.get(contentId);
    if (!item) throw new Error(`Content '${contentId}' not found`);

    const allStages = [...this.stages.keys()];
    const completed = [...item.completedStages];
    const pending = allStages.filter(s => !item.completedStages.has(s));

    let status = "queued";

    if (item.failed) status = "failed";
    else if (completed.length === 0) status = "queued";
    else if (pending.length === 0) status = "completed";
    else status = "in_progress";

    return {
      contentId,
      currentStage: pending[0] ?? null,
      completedStages: completed,
      pendingStages: pending,
      status,
      failureReason: item.failureReason
    };
  }

  /**
   * Get the processing queue ordered by priority (highest first), then FIFO.
   * Only includes content that still has stages to process (not completed/failed).
   * @returns {Array<{ contentId, title, priority, currentStage }>}
   */
  getQueue() {
    const items = [];

    for (const [contentId, item] of this.contents.entries()) {
      if (item.failed) continue;

      const allStages = [...this.stages.keys()];
      if (item.completedStages.size === allStages.length) continue; // completed

      const pendingStages = allStages.filter(
        s => !item.completedStages.has(s)
      );

      items.push({
        contentId,
        title: item.content.title,
        priority: item.priority,
        currentStage: pendingStages[0] ?? null,
        createdAt: item.createdAt
      });
    }

    items.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.createdAt - b.createdAt;
    });

    return items;
  }
}

module.exports = ContentPipeline;
