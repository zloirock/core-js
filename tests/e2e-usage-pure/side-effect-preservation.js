/* eslint-disable no-unsafe-optional-chaining, @stylistic/no-extra-parens, sonarjs/no-extra-arguments --
   these tests intentionally exercise optional-chain short-circuits, paren-terminated optional lookups,
   and side-effecting inline-call arguments to count the resulting runtime effects */
// Side-effect preservation across polyfill rewrites: an effect (counter increment) carried in a computed
// key / call argument that the rewrite folds or collapses must run the SAME number of times as it does
// natively. Counting the effect at runtime is the direct oracle - a dropped effect leaves the count at 0.

// SE1: a polyfilled instance method reached via a parenthesized OPTIONAL member with a side-effecting
// computed key. The key effect fires once on a non-null receiver, and NOT at all when the optional chain
// short-circuits - native evaluates the key only after the receiver is confirmed non-null.
QUnit.test('side effect: paren-lookup optional computed-key fires once on a non-null receiver', assert => {
  let probe = 0;
  const arr = [1, 2, 3];
  const result = (arr?.[(probe++, 'includes')])(2);
  assert.true(result);
  assert.strictEqual(probe, 1);
});

QUnit.test('side effect: paren-lookup optional computed-key is skipped on a nullish short-circuit', assert => {
  let probe = 0;
  const arr = null;
  assert.throws(() => (arr?.[(probe++, 'includes')])(2));
  assert.strictEqual(probe, 0);
});

// SE2: an inline-resolvable call `(() => Array)(arg)` folds to its returned receiver `Array`, but the call
// ARGUMENT still runs at call time and must be preserved alongside the folded receiver.
QUnit.test('side effect: inline-call argument runs once when the call folds to its receiver', assert => {
  let calls = 0;
  const has = 'from' in (() => Array)(calls++);
  assert.true(has);
  assert.strictEqual(calls, 1);
});

// SE5: a side-effecting computed key in a destructure evaluates at destructure time. The static-extract
// rewrite folds the key effect into the emitted value so it still runs exactly once.
QUnit.test('side effect: destructure computed-key effect runs exactly once', assert => {
  let keyEval = 0;
  const { [(keyEval++, 'from')]: build } = Array;
  assert.deepEqual(build([1, 2, 3]), [1, 2, 3]);
  assert.strictEqual(keyEval, 1);
});
