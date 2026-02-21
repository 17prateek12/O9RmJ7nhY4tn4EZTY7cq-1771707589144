/**
 * ContentPipeline - A content production pipeline with stages, dependencies,
 * quality gates, and priority ordering.
 *
 * Implement all methods below according to the README specifications.
 */
class ContentPipeline {
  constructor() {
    // TODO: Initialize your data structures
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
    throw new Error('Not implemented: addStage');
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
    throw new Error('Not implemented: submit');
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
    throw new Error('Not implemented: advance');
  }

  /**
   * Get the full status of a content item.
   * @param {string} contentId
   * @returns {Object} { contentId, currentStage, completedStages, pendingStages, status, failReason }
   *   status: 'queued' | 'in_progress' | 'completed' | 'failed'
   * @throws {Error} If contentId doesn't exist
   */
  getStatus(contentId) {
    throw new Error('Not implemented: getStatus');
  }

  /**
   * Get the processing queue ordered by priority (highest first), then FIFO.
   * Only includes content that still has stages to process (not completed/failed).
   * @returns {Array<{ contentId, title, priority, currentStage }>}
   */
  getQueue() {
    throw new Error('Not implemented: getQueue');
  }
}

module.exports = ContentPipeline;
