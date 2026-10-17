// The default's receiver must not hide the supplied source before sibling imports run.
// Promise keeps this regression independent of the earlier modules' Map imports.
let observed;
// eslint-disable-next-line no-useless-assignment -- the census must see a different initial source
let sources = [Array];
for (let i = 0; i < 1; i++) {
  sources = [Promise];
  // eslint-disable-next-line es/no-nonstandard-object-properties -- the unused default must name a different constructor
  const [{ allSettled } = Object] = sources;
  observed = allSettled;
}

QUnit.test('an array pattern default preserves the supplied constructor static', assert => {
  assert.same(typeof observed, 'function');
});
