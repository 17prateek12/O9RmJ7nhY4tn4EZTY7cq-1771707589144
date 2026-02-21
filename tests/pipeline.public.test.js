const ContentPipeline = require('../src/pipeline');

describe('Content Pipeline - Public Tests', () => {
  let pipeline;

  beforeEach(() => {
    pipeline = new ContentPipeline();
  });

  test('can add stages and submit content to the pipeline', () => {
    pipeline.addStage('concept');
    pipeline.addStage('script', { dependsOn: ['concept'] });

    const id = pipeline.submit({ title: 'Nike Ad', type: 'video' });

    expect(typeof id).toBe('string');
    const status = pipeline.getStatus(id);
    expect(status.status).toBe('queued');
  });

  test('content advances through stages in dependency order', () => {
    pipeline.addStage('concept');
    pipeline.addStage('script', { dependsOn: ['concept'] });
    pipeline.addStage('production', { dependsOn: ['script'] });

    const id = pipeline.submit({ title: 'NBC Promo', type: 'video' });

    pipeline.advance(id);
    pipeline.advance(id);
    pipeline.advance(id);

    const status = pipeline.getStatus(id);
    expect(status.completedStages).toEqual(['concept', 'script', 'production']);
  });

  test('quality checks run when content is advanced', () => {
    pipeline.addStage('concept');
    pipeline.addStage('review', {
      dependsOn: ['concept'],
      qualityCheck: () => ({ passed: false, reason: 'Too generic' })
    });

    const id = pipeline.submit({ title: 'Draft', type: 'social' });

    pipeline.advance(id); // concept passes
    const result = pipeline.advance(id); // review fails

    expect(result.status).toBe('failed');
    expect(result.reason).toBe('Too generic');
  });

  test('higher priority content appears first in the queue', () => {
    pipeline.addStage('concept');

    pipeline.submit({ title: 'Low Priority', type: 'video' }, { priority: 1 });
    pipeline.submit({ title: 'High Priority', type: 'video' }, { priority: 10 });

    const queue = pipeline.getQueue();
    expect(queue[0].title).toBe('High Priority');
    expect(queue[1].title).toBe('Low Priority');
  });
});
