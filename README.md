# Hume Content Pipeline Engine

## Background

Hume creates Premium AI Content and IP — videos, social ads, AI influencers — for brands like Nike, NBC, and Epic Games. Every piece of content flows through a production pipeline: concept development, scriptwriting, production, and review. Quality gates ensure nothing ships that would harm brand trust.

Build the `ContentPipeline` class that powers this workflow.

## Objective

Build a content production pipeline with configurable stages, dependency ordering, quality gates, and priority-based scheduling.

## Time

You have **30 minutes**.

Recommended split: ~5 min reading + planning, ~25 min implementation.

## Requirements

Implement the following methods on the `ContentPipeline` class in `src/pipeline.js`:

### `addStage(name, options?)` — Register a production stage

- Adds a named stage to the pipeline (e.g., `'concept'`, `'script'`, `'production'`).
- `options.dependsOn` (optional): An array of stage names that must complete before this stage can run.
- `options.qualityCheck` (optional): A function `(content) => { passed: boolean, reason?: string }` that runs when content enters this stage.
- Throws an error if a stage with the same name already exists.

### `submit(content, options?)` — Submit content into the pipeline

- `content` must have `title` and `type` properties. Throws an error if either is missing.
- `options.priority` (optional, default `0`): Higher values = processed first.
- Returns an auto-generated `contentId` string.

### `advance(contentId)` — Move content to its next stage

- Finds the first pending stage (in registration order) whose dependencies are **all** completed.
- If the stage has a `qualityCheck`, runs it:
  - If the check returns `{ passed: false, reason }`, the content **fails** — it cannot advance further.
  - If the check returns `{ passed: true }`, the content passes through normally.
- Returns `{ stage, status: 'stage_complete' }` on success, or `{ stage, status: 'failed', reason }` on quality check failure.
- Throws an error if:
  - The `contentId` doesn't exist
  - The content has already completed all stages or has failed
  - No stages are available (unresolvable dependencies, e.g., circular)

### `getStatus(contentId)` — Get full content status

- Returns an object with:
  - `contentId` — The content's ID
  - `currentStage` — The last completed stage (or `null` if none)
  - `completedStages` — Array of completed stage names (in order)
  - `pendingStages` — Array of stages not yet completed (in registration order)
  - `status` — One of: `'queued'` (not yet advanced), `'in_progress'`, `'completed'`, `'failed'`
  - `failReason` — The reason string if failed, otherwise `null`
- Throws an error if the `contentId` doesn't exist.

### `getQueue()` — Get the processing queue

- Returns an array of `{ contentId, title, priority, currentStage }` for all content that still has stages to process (not completed or failed).
- Sorted by **priority descending** (highest first), with **FIFO** tiebreaking for same-priority items.

## Getting Started

1. Run `npm install`
2. Open `src/pipeline.js` — all method stubs are provided
3. Run the public tests: `npm test`
4. Implement each method, running tests as you go

## Hints

- Think about what data structures to use for stages vs. content items.
- Stage order matters — the first stage whose dependencies are met gets processed next.
- Consider what happens when no stage's dependencies can ever be met (circular).
- Quality checks affect the content's overall status, not just the stage result.

## Evaluation

You will be graded on **correctness** across a comprehensive hidden test suite covering:
- Content production flow through multiple stages
- Dependency resolution between stages
- Quality control gate enforcement
- Priority handling and queue ordering
- Reliability and edge case handling
