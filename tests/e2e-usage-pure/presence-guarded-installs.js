// presence-guarded polyfill installs at MODULE level whose tests this build decides, in their own module:
// the installs never run, so every read of the global - ahead of them, after them, deferred into a
// function - takes the pure import, which an engine lacking the global needs. a live install of the slot
// anywhere in this file would leave the reads after it to the user's slot, so none stands here. each read
// is captured where it stands and asserted later, and the slot is put back through a computed key, which no
// transform reads as a write, should an install run after all
const promiseKey = ['Pro', 'mise'].join('');
const hadPromise = typeof globalThis[promiseKey] == 'function';
const savedPromise = globalThis[promiseKey];
function restorePromise() {
  if (hadPromise) globalThis[promiseKey] = savedPromise;
  else delete globalThis[promiseKey];
}
function DeadPromiseShim() { /* never installed */ }

// a read above two installs the build decides alike, whichever of them is settled first
function resolveFromAbove() { return Promise.resolve(1); }
if (!globalThis.Promise) globalThis.Promise = DeadPromiseShim;
if (typeof Promise == 'undefined') globalThis.Promise = DeadPromiseShim;

// a presence test of a prototype method beside the presence test of its constructor
let afterPrototypeTest;
try {
  if (!globalThis.Promise || !globalThis.Promise.prototype.finally) globalThis.Promise = DeadPromiseShim;
  afterPrototypeTest = Promise.resolve(2);
} catch (error) {
  afterPrototypeTest = error;
}
restorePromise();

// a presence test of a static by `typeof` and by `in`
let afterStaticTest;
try {
  if (typeof Promise.allSettled != 'function' || !('any' in Promise)) globalThis.Promise = DeadPromiseShim;
  afterStaticTest = Promise.allSettled([3]);
} catch (error) {
  afterStaticTest = error;
}
restorePromise();

QUnit.test('presence-guarded installs: a read above the installs takes the pure import', assert => {
  return resolveFromAbove().then(value => assert.same(value, 1));
});

QUnit.test('presence-guarded installs: a prototype method test leaves the read after it served', assert => {
  return afterPrototypeTest.then(value => assert.same(value, 2));
});

QUnit.test('presence-guarded installs: a static test leaves the read after it served', assert => {
  return afterStaticTest.then(results => assert.same(results[0].value, 3));
});
