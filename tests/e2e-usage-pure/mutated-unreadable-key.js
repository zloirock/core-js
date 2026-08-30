// an UNREADABLE mutation KEY deopts the whole receiver, so these live in their own module: the
// file-wide verdict re-routes every read of the same name, and a sibling test would be compiled
// against it. what they lock is that such a deopt keeps the CONSTRUCTOR injected - the write and
// every read of it land on ONE object, and in a realm with no native that object can only be the
// ponyfill. leaving the name verbatim (the older verdict) leaves nothing for either surface to
// reach there, so the write itself throws
/* eslint-disable es/no-nonstandard-promise-properties -- the custom-key mutation IS the case under test */
QUnit.test('mutated-statics: an unreadable key keeps the constructor injected', assert => {
  const key = String.fromCharCode(107, 49);
  Promise[key] = function patched() { return 'UNREADABLE-KEY'; };
  try {
    assert.same(typeof Promise, 'function');
    assert.same(Promise[key](), 'UNREADABLE-KEY');
  } finally {
    delete Promise[key];
  }
});
/* eslint-enable es/no-nonstandard-promise-properties -- end of the unreadable-key case */

// ... and the same for a mutator CALL whose key it cannot read: the receiver argument and the
// reads below it are one object
/* eslint-disable es/no-nonstandard-map-properties -- the custom-key mutation IS the case under test */
QUnit.test('mutated-statics: an unreadable mutator-call key keeps the constructor injected', assert => {
  const key = String.fromCharCode(107, 50);
  Object.defineProperty(Map, key, { configurable: true, value: 'UNREADABLE-CALL-KEY' });
  try {
    assert.same(typeof Map, 'function');
    assert.same(Map[key], 'UNREADABLE-CALL-KEY');
  } finally {
    delete Map[key];
  }
});
/* eslint-enable es/no-nonstandard-map-properties -- end of the unreadable mutator-call case */
