/* eslint-disable no-var, no-useless-assignment, unicorn/consistent-function-style -- These initializers intentionally follow the reads. */
QUnit.test('mutation channel: invoked-return-before-init', assert => {
  let caught = false;
  try {
    pick().from = () => 'patched';
  } catch {
    caught = true;
  }
  var pick = function () { return Array; };
  assert.true(caught, 'the call precedes initialization');
  assert.deepEqual(Array.from([1]), [1], 'a failed call does not patch the constructor');
});

QUnit.test('mutation channel: invoked-return-early-alias', assert => {
  var alias = pick;
  var pick = function () { return Array; };
  function run() { alias().from = () => 'patched'; }
  let caught = false;
  try {
    run();
  } catch {
    caught = true;
  }
  assert.true(caught, 'the alias captured undefined before initialization');
  assert.deepEqual(Array.from([1]), [1], 'a later invocation cannot change the captured value');
});
