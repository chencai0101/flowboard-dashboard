/**
 * Tests for US-01: Backend allow updating 'created' field via PUT API
 * 
 * These tests verify:
 * 1. The ALLOWED array in the PUT handler includes 'created'
 * 2. The auto-fill/clear logic for 'completed' on status changes is present
 */
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('node:fs');

const serverPath = path.join(__dirname, '..', 'server.js');
const serverCode = fs.readFileSync(serverPath, 'utf8');

test('US-01: ALLOWED array includes created field', () => {
  // Find the ALLOWED array in the PUT handler (around line 643)
  // Pattern: const ALLOWED = ['title', 'status', 'priority', 'specFile', 'completed', 'dueDate', 'created'];
  const allowedMatch = serverCode.match(/const ALLOWED = \[[^\]]+\]/);
  assert.ok(allowedMatch, 'ALLOWED array should exist in server.js');
  
  const allowedStr = allowedMatch[0];
  assert.ok(
    allowedStr.includes("'created'"),
    `ALLOWED array should include 'created'. Found: ${allowedStr}`
  );
  console.log('  ✓ ALLOWED array includes "created":', allowedStr);
});

test('US-01: PUT handler auto-sets completed when status changes to done', () => {
  // When task moves to done status, completed should be auto-set to today's date
  // Pattern: if (updates.status === 'done' && task.status !== 'done') { updates.completed = ... }
  const doneAutoFillPattern = /if\s*\(\s*updates\.status\s*===\s*['"]done['"]\s*&&\s*task\.status\s*!==\s*['"]done['"]\s*\)/;
  assert.ok(
    doneAutoFillPattern.test(serverCode),
    'Should auto-fill completed when status changes to done'
  );
  console.log('  ✓ Auto-fill completed on status=done logic present');
});

test('US-01: PUT handler clears completed when status leaves done', () => {
  // When task moves out of done status, completed should be cleared
  // Pattern: if (updates.status && updates.status !== 'done' && task.status === 'done') { updates.completed = null; }
  const doneClearPattern = /if\s*\(\s*updates\.status\s*&&\s*updates\.status\s*!==\s*['"]done['"]\s*&&\s*task\.status\s*===\s*['"]done['"]\s*\)/;
  assert.ok(
    doneClearPattern.test(serverCode),
    'Should clear completed when status leaves done'
  );
  console.log('  ✓ Clear completed on status leave-done logic present');
});

test('US-01: PUT handler applies all ALLOWED fields including created', () => {
  // Verify the for...of loop that applies ALLOWED fields is present
  // Pattern: for (const key of ALLOWED) { if (Object.prototype.hasOwnProperty.call(updates, key)) { task[key] = updates[key]; } }
  const applyLoopPattern = /for\s*\(\s*const\s+key\s+of\s+ALLOWED\s*\)\s*\{[^}]+hasOwnProperty\.call\s*\(\s*updates,\s*key\s*\)[^}]+task\[key\]\s*=\s*updates\[key\]/;
  assert.ok(
    applyLoopPattern.test(serverCode),
    'Should have for-of loop applying ALLOWED fields to task'
  );
  console.log('  ✓ ALLOWED fields application loop present');
});
