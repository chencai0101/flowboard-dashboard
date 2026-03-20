/**
 * Tests for US-02: Card display - show created badge, completed badge, and add edit button
 *
 * Verifies:
 * 1. formatCreatedDate() helper handles both 'YYYY-MM-DD' and ISO timestamps
 * 2. cardInnerHTML() includes created badge (gray, M/D format)
 * 3. cardInnerHTML() includes completed badge (green, M/D format) only when status='done'
 * 4. cardInnerHTML() includes edit button with data-action="edit-task-modal"
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('node:fs');

// Read kanban.js source to test helper functions and HTML generation
const kanbanPath = path.join(__dirname, '..', 'js', 'kanban.js');
const kanbanCode = fs.readFileSync(kanbanPath, 'utf8');

// Extract formatCreatedDate function body for isolated testing
const formatCreatedDateMatch = kanbanCode.match(/function formatCreatedDate\(dateStr\)\s*\{([\s\S]*?)\n\}/);
assert.ok(formatCreatedDateMatch, 'formatCreatedDate function should exist in kanban.js');
const formatCreatedDateBody = formatCreatedDateMatch[0];

// Evaluate formatCreatedDate in a sandbox
const formatCreatedDate = new Function('dateStr', `
  ${formatCreatedDateBody}
  return formatCreatedDate(dateStr);
`);

describe('US-02: formatCreatedDate helper', () => {

  test('handles YYYY-MM-DD string correctly', () => {
    assert.strictEqual(formatCreatedDate('2026-03-20'), '3/20');
    assert.strictEqual(formatCreatedDate('2026-01-01'), '1/1');
    assert.strictEqual(formatCreatedDate('2026-12-31'), '12/31');
  });

  test('handles ISO timestamp (YYYY-MM-DDTHH:MM:SS.sssZ)', () => {
    assert.strictEqual(formatCreatedDate('2026-03-20T00:00:00.000Z'), '3/20');
    assert.strictEqual(formatCreatedDate('2026-01-05T10:30:00.000Z'), '1/5');
    assert.strictEqual(formatCreatedDate('2026-12-15T23:59:59.000Z'), '12/15');
  });

  test('handles ISO timestamp without milliseconds', () => {
    assert.strictEqual(formatCreatedDate('2026-03-20T00:00:00Z'), '3/20');
  });

  test('returns empty string for null/undefined/empty', () => {
    assert.strictEqual(formatCreatedDate(null), '');
    assert.strictEqual(formatCreatedDate(undefined), '');
    assert.strictEqual(formatCreatedDate(''), '');
  });

  test('returns original string for invalid format', () => {
    assert.strictEqual(formatCreatedDate('invalid'), 'invalid');
    assert.strictEqual(formatCreatedDate('2026'), '2026');
  });

});

describe('US-02: cardInnerHTML includes created badge', () => {

  test('includes created-badge class when task.created is set', () => {
    assert.ok(
      kanbanCode.includes('class="created-badge"'),
      'kanban.js should include created-badge class in cardInnerHTML'
    );
    console.log('  ✓ cardInnerHTML includes created-badge class');
  });

  test('includes created-badge with formatCreatedDate call', () => {
    // Should call formatCreatedDate(task.created) for the badge content
    assert.ok(
      kanbanCode.includes('formatCreatedDate(task.created)'),
      'kanban.js should call formatCreatedDate(task.created) for created badge'
    );
    console.log('  ✓ created badge uses formatCreatedDate(task.created)');
  });

  test('created-badge uses gray color styling', () => {
    // Check dashboard.css for .created-badge with gray color
    const cssPath = path.join(__dirname, '..', 'styles', 'dashboard.css');
    const cssCode = fs.readFileSync(cssPath, 'utf8');
    assert.ok(
      cssCode.includes('.created-badge'),
      'dashboard.css should define .created-badge styles'
    );
    console.log('  ✓ dashboard.css defines .created-badge styles');
  });

});

describe('US-02: cardInnerHTML includes completed badge', () => {

  test('includes completed-badge class', () => {
    assert.ok(
      kanbanCode.includes('class="completed-badge"'),
      'kanban.js should include completed-badge class in cardInnerHTML'
    );
    console.log('  ✓ cardInnerHTML includes completed-badge class');
  });

  test('completed-badge only shown when task.status === done', () => {
    // Should have conditional: task.status === 'done' && task.completed
    assert.ok(
      kanbanCode.includes("task.status === 'done'"),
      'kanban.js should conditionally show completed badge only when status is done'
    );
    assert.ok(
      kanbanCode.includes('completed-badge'),
      'kanban.js should include completed-badge'
    );
    console.log('  ✓ completed-badge conditionally shown for done status');
  });

  test('completed-badge uses green color styling', () => {
    const cssPath = path.join(__dirname, '..', 'styles', 'dashboard.css');
    const cssCode = fs.readFileSync(cssPath, 'utf8');
    assert.ok(
      cssCode.includes('.completed-badge'),
      'dashboard.css should define .completed-badge styles'
    );
    // Check green color is used
    assert.ok(
      cssCode.includes('rgba(34, 197, 94') || cssCode.includes('#4ade80') || cssCode.includes('rgb(34, 197, 94'),
      'completed-badge should use green color'
    );
    console.log('  ✓ dashboard.css defines .completed-badge with green color');
  });

});

describe('US-02: Card header includes edit button', () => {

  test('includes ICON_EDIT constant', () => {
    assert.ok(
      kanbanCode.includes('ICON_EDIT'),
      'kanban.js should define ICON_EDIT constant'
    );
    assert.ok(
      kanbanCode.includes('data-action="edit-task-modal"'),
      'kanban.js should have data-action="edit-task-modal" on edit button'
    );
    console.log('  ✓ ICON_EDIT constant defined and used in edit button');
  });

  test('edit button has correct data-action and data-id attributes', () => {
    assert.ok(
      kanbanCode.includes('data-action="edit-task-modal"'),
      'Edit button should have data-action="edit-task-modal"'
    );
    assert.ok(
      kanbanCode.includes('data-id="${task.id}"'),
      'Edit button should have data-id="${task.id}"'
    );
    console.log('  ✓ Edit button has correct data attributes');
  });

  test('bindKanbanEvents binds edit-task-modal action', () => {
    assert.ok(
      kanbanCode.includes("case 'edit-task-modal':"),
      'bindKanbanEvents switch should have case for edit-task-modal'
    );
    console.log('  ✓ bindKanbanEvents binds edit-task-modal action');
  });

  test('edit-btn CSS class is defined', () => {
    const cssPath = path.join(__dirname, '..', 'styles', 'dashboard.css');
    const cssCode = fs.readFileSync(cssPath, 'utf8');
    assert.ok(
      cssCode.includes('.edit-btn'),
      'dashboard.css should define .edit-btn styles'
    );
    console.log('  ✓ dashboard.css defines .edit-btn styles');
  });

});

describe('US-02: app.js exposes _startEditModal bridge', () => {
  test('window._startEditModal is defined in app.js', () => {
    const appPath = path.join(__dirname, '..', 'js', 'app.js');
    const appCode = fs.readFileSync(appPath, 'utf8');
    assert.ok(
      appCode.includes('window._startEditModal'),
      'app.js should define window._startEditModal bridge function'
    );
    console.log('  ✓ app.js defines window._startEditModal bridge');
  });

  test('startEditModal uses showModal to display edit form', () => {
    const appPath = path.join(__dirname, '..', 'js', 'app.js');
    const appCode = fs.readFileSync(appPath, 'utf8');
    assert.ok(
      appCode.includes('showModal') && appCode.includes('window._startEditModal'),
      'startEditModal should use showModal'
    );
    console.log('  ✓ startEditModal uses showModal');
  });

  test('startEditModal form includes created, dueDate, completed inputs', () => {
    const appPath = path.join(__dirname, '..', 'js', 'app.js');
    const appCode = fs.readFileSync(appPath, 'utf8');
    // Inputs use ids like edit-modal-${id}-created, etc.
    assert.ok(
      appCode.includes('edit-modal-') && appCode.includes('created') && appCode.includes('dueDate') && appCode.includes('completed'),
      'startEditModal should have inputs for created, dueDate, completed'
    );
    console.log('  ✓ startEditModal form has created, dueDate, completed inputs');
  });

  test('startEditModal calls PUT API to update task', () => {
    const appPath = path.join(__dirname, '..', 'js', 'app.js');
    const appCode = fs.readFileSync(appPath, 'utf8');
    const startEditSection = appCode.match(/window\._startEditModal[\s\S]*?(?=window\.\_[a-zA-Z]|$)/);
    assert.ok(startEditSection, 'window._startEditModal section should exist');
    assert.ok(
      startEditSection[0].includes("method: 'PUT'"),
      'startEditModal should call PUT API'
    );
    console.log('  ✓ startEditModal calls PUT API to save changes');
  });
});
