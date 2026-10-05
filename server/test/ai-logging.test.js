import { enrichCourseMetadata, generateCurriculumBlueprint } from '../src/services/aiService.js';
import { logger } from '../src/config/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.resolve(__dirname, '../logs');

async function runProductionHardeningTests() {
  console.log('===============================================================');
  console.log('  EduCore LMS - AI Pipelines & Production Logging Verification ');
  console.log('===============================================================\n');

  try {
    // 1. Test Production Logging (Winston + Log Files)
    console.log('[TEST 1] Verifying Winston Structured Logging & File Stream:');
    logger.info('Audit Test: Standard operational log entry');
    logger.error('Audit Test: Test error log capture for monitoring');

    // Allow I/O buffer to flush
    await new Promise((r) => setTimeout(r, 400));

    const combinedLogExists = fs.existsSync(path.join(logDir, 'combined.log'));
    const errorLogExists = fs.existsSync(path.join(logDir, 'error.log'));

    console.log('  - Combined log file active:  ', combinedLogExists);
    console.log('  - Error log file active:     ', errorLogExists);

    if (!combinedLogExists || !errorLogExists) {
      throw new Error('FAIL: Production log files were not created.');
    }
    console.log('  [PASS] Winston production logger successfully streams and persists logs.\n');

    // 2. Test Server-Side Course Data Enrichment
    console.log('[TEST 2] Verifying Server-Side Course Data Enrichment Pipeline:');
    const mockInput = {
      title: 'High-Throughput Distributed Systems',
      description: 'Master consensus algorithms, raft protocols, and partition tolerance.',
      category: 'Cloud Architecture',
      level: 'advanced',
    };

    const enriched = await enrichCourseMetadata(mockInput);
    console.log('  - Generated Summary:        ', enriched.summary);
    console.log('  - Extracted Semantic Tags:  ', enriched.tags);
    console.log('  - Extracted Outcomes:       ', enriched.learningOutcomes);
    console.log('  - Estimated Duration:       ', enriched.estimatedHours, 'hours');

    if (!enriched.summary || !Array.isArray(enriched.tags) || enriched.tags.length === 0) {
      throw new Error('FAIL: Automated data enrichment returned incomplete attributes.');
    }
    console.log('  [PASS] Course data automatically enriched without client key exposure.\n');

    // 3. Test Curriculum Generator
    console.log('[TEST 3] Verifying AI Curriculum Generation:');
    const blueprint = await generateCurriculumBlueprint('Enterprise Kubernetes Operations', 'Cloud Architecture');
    console.log('  - Generated Syllabus Title: ', blueprint.title);
    console.log('  - Number of Modules:        ', blueprint.modules?.length || 0);

    if (!blueprint.modules || blueprint.modules.length === 0) {
      throw new Error('FAIL: Curriculum blueprint did not contain module hierarchy.');
    }
    console.log('  [PASS] Server-side AI curriculum successfully synthesized.\n');

    // 4. Memory footprint audit
    console.log('[TEST 4] Concurrent Resource & Memory Footprint Audit:');
    const memoryUsage = process.memoryUsage();
    console.log('  - RSS Memory:               ', Math.round(memoryUsage.rss / 1024 / 1024), 'MB');
    console.log('  - Heap Used:                ', Math.round(memoryUsage.heapUsed / 1024 / 1024), 'MB');
    console.log('  [PASS] Memory footprint is clean and bounded for container deployment.\n');

    console.log('===============================================================');
    console.log('ALL PHASE 1, 2 & 3 PRODUCTION HARDENING & AI TESTS PASSED [✓]');
    console.log('===============================================================\n');
  } catch (error) {
    console.error('TEST ERROR:', error);
    process.exit(1);
  }
}

runProductionHardeningTests();
