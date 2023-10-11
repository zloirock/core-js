import DEG_PER_RAD from '@core-js/pure/full/math/deg-per-rad';
import MathNamespace from '@core-js/pure/full/math';

QUnit.test('Math.DEG_PER_RAD', assert => {
  assert.same(MathNamespace.DEG_PER_RAD, DEG_PER_RAD);
  assert.nonEnumerable(MathNamespace, 'DEG_PER_RAD');
  assert.nonConfigurable(MathNamespace, 'DEG_PER_RAD');
  assert.nonWritable(MathNamespace, 'DEG_PER_RAD');
  assert.same(DEG_PER_RAD, Math.PI / 180, 'Is Math.PI / 180');
});
