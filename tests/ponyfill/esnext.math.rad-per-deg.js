import RAD_PER_DEG from '../../ponyfill/fn/math/rad-per-deg';

QUnit.test('Math.RAD_PER_DEG', assert => {
  assert.strictEqual(RAD_PER_DEG, 180 / Math.PI, 'Is 180 / Math.PI');
});
