import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';

const legacyWorkflowPath = 'app/(legacy)/workflow';
const workflowFiles = [
  'calculation-step.tsx',
  'dashboard-step.tsx',
  'demand-step.tsx',
  'master-step.tsx',
  'report-step.tsx',
  'step-frame.tsx',
  'supply-step.tsx',
];

test('4회차 workflow 컴포넌트가 legacy 경로에 격리된다', () => {
  assert.equal(existsSync('components/workflow'), false);
  assert.deepEqual(readdirSync(legacyWorkflowPath).sort(), workflowFiles.sort());

  const procurementApp = readFileSync('components/procurement-app.tsx', 'utf8');
  assert.doesNotMatch(procurementApp, /@\/components\/workflow/);
  assert.match(procurementApp, /@\/app\/\(legacy\)\/workflow/);
});
