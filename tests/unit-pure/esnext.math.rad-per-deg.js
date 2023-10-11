import RAD_PER_DEG from '@core-js/pure/full/math/rad-per-deg';
import MathNamespace from '@core-js/pure/full/math';

QUnit.test('Math.RAD_PER_DEG', assert => {
  assert.same(MathNamespace.RAD_PER_DEG, RAD_PER_DEG);
  assert.nonEnumerable(MathNamespace, 'RAD_PER_DEG');
  assert.nonConfigurable(MathNamespace, 'RAD_PER_DEG');
  assert.nonWritable(MathNamespace, 'RAD_PER_DEG');
  assert.same(RAD_PER_DEG, 180 / Math.PI, 'Is 180 / Math.PI');
});
