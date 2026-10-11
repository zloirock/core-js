// a polyfill install at MODULE level under a guard this build cannot decide that reads a capture of the
// global, in its own module: the capture decides the install as much as a read in the guard, so it stays the
// user's and the install runs as the engine answers - the read after it reads the shim where the engine
// lacks the global, the engine's own where it has one. the slot is saved and put back through a computed
// key, which no transform reads as a write
const promiseKey = ['Pro', 'mise'].join('');
const hadPromise = typeof globalThis[promiseKey] == 'function';
const savedPromise = globalThis[promiseKey];
function CaptureShim(value) { this.value = value; }
CaptureShim.resolve = function (value) { return new CaptureShim(value); };

// eslint-disable-next-line no-var -- the hoisted capture is the realistic spelling
var CapturedPromise = globalThis.Promise;
if (!CapturedPromise || CapturedPromise.length !== 1) globalThis.Promise = CaptureShim;
let afterCapture;
try {
  afterCapture = Promise.resolve(2);
} catch (error) {
  afterCapture = error;
}
if (hadPromise) globalThis[promiseKey] = savedPromise;
else delete globalThis[promiseKey];

QUnit.test('presence-guarded open install: a captured read the guard tests decides the install', assert => {
  assert.same(afterCapture instanceof CaptureShim, !hadPromise);
  if (hadPromise) return afterCapture.then(value => assert.same(value, 2));
  assert.same(afterCapture.value, 2);
  return undefined;
});
