import { restoreProperty } from '../helpers/restore-property.cjs';

// Missing natives belong to the suite's stripped legs; post-only runs use the full realm.
QUnit.test('logical patch: cast target keeps the receiver and prefers the polyfill', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array.prototype, 'flatMap');
  const effects: string[] = [];
  try {
    (Array.prototype.flatMap as any) ??= (effects.push('rhs'), () => ['fallback']);
    // The served guard leaves the raw native slot alone.
    const installed = Array.prototype.flatMap;
    assert.deepEqual(installed.call([2, 3], value => [value, value + 1]), [2, 3, 3, 4]);
    assert.deepEqual(effects, [], 'the source fallback is not evaluated');
  } finally {
    restoreProperty(Array.prototype, 'flatMap', descriptor);
  }
});

QUnit.test('logical patch: non-null target keeps its receiver', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array.prototype, 'flatMap');
  const effects: string[] = [];
  try {
    Array.prototype.flatMap! ||= (effects.push('rhs'), () => ['fallback']);
    const installed = Array.prototype.flatMap;
    assert.deepEqual(installed.call([2, 3], value => [value]), [2, 3]);
    assert.deepEqual(effects, [], 'the source fallback is not evaluated');
  } finally {
    restoreProperty(Array.prototype, 'flatMap', descriptor);
  }
});

QUnit.test('logical patch: computed key effects run once', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array.prototype, 'flatMap');
  const effects: string[] = [];
  try {
    Array.prototype[(effects.push('key'), 'flatMap')] ||= (effects.push('rhs'), () => ['fallback']);
    const installed = Array.prototype.flatMap;
    assert.deepEqual(installed.call([2, 3], value => [value]), [2, 3]);
    assert.deepEqual(effects, ['key'], 'the key is evaluated once and the fallback is skipped');
  } finally {
    restoreProperty(Array.prototype, 'flatMap', descriptor);
  }
});

// Babel's combined TS erasure and logical-assignment lowering duplicates a wrapped key.
// This unpolyfilled slot isolates the upstream defect; the same source fails without our plugin.
QUnit.todo('logical patch: upstream lowering keeps a non-null computed key single', assert => {
  const effects: string[] = [];
  const receiver: { method?: number } = {};
  receiver[(effects.push('key'), 'method')]! ||= 1;
  assert.deepEqual(effects, ['key']);
});
