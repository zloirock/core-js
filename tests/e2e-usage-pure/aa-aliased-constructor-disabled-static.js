// Capture the disabled read before sibling imports can attach statics to the ponyfill.
const wrapper = { C: Iterator };
const {
  // core-js-disable-next-line
  C: { from },
} = wrapper;
let observed;
let failure;
try {
  observed = from([1, 2, 3]);
} catch (error) {
  failure = error;
}

QUnit.test('an opted-out static read stays available on a substituted constructor', assert => {
  assert.same(failure, undefined);
  assert.same(typeof observed?.next, 'function');
  if (observed) assert.same(observed.next().value, 1);
});
