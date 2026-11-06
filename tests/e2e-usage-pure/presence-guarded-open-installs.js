// polyfill installs at MODULE level under guards this build cannot decide, in their own module: the install
// runs as the engine answers, so the reads the guard decides by stay the user's and the reads after it read
// what the install left - the shim where the engine lacks the global, the engine's own where it has one. the
// slot is saved and put back through a computed key, which no transform reads as a write. a live install
// leaves every later read of its slot to the user, so one install of a global per module
const promiseKey = ['Pro', 'mise'].join('');
const hadPromise = typeof globalThis[promiseKey] == 'function';
const savedPromise = globalThis[promiseKey];
function OpenShim(value) { this.value = value; }
OpenShim.resolve = function (value) { return new OpenShim(value); };

// a check of the engine's own shape beside the presence test
if (typeof Promise == 'undefined' || Promise.length !== 1) globalThis.Promise = OpenShim;
let afterShapeCheck;
try {
  afterShapeCheck = Promise.resolve(1);
} catch (error) {
  afterShapeCheck = error;
}
if (hadPromise) globalThis[promiseKey] = savedPromise;
else delete globalThis[promiseKey];

// an optional static call ahead of an install that may run reads the slot this build serves
const installArray = promiseKey === 'install';
let lastAhead;
try {
  lastAhead = Array.from?.([1, 2, 3]).at(-1);
} catch (error) {
  lastAhead = error;
}
function ArrayShim() { /* never installed */ }
if (installArray) globalThis.Array = ArrayShim;

QUnit.test('presence-guarded open installs: a shape check beside the presence test decides the install', assert => {
  assert.same(afterShapeCheck instanceof OpenShim, !hadPromise);
  if (hadPromise) return afterShapeCheck.then(value => assert.same(value, 1));
  assert.same(afterShapeCheck.value, 1);
  return undefined;
});

QUnit.test('presence-guarded open installs: an optional static call ahead of the install is served', assert => {
  assert.same(lastAhead, 3);
});
