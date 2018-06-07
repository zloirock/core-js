import { DESCRIPTORS } from '../helpers/constants';

import defineProperties from 'core-js-pure/features/object/define-properties';

QUnit.test('Object.defineProperties', assert => {
  assert.isFunction(defineProperties);
  assert.arity(defineProperties, 2);
  const source = {};
  const result = defineProperties(source, { q: { value: 42 }, w: { value: 33 } });
  assert.same(result, source);
  assert.same(result.q, 42);
  assert.same(result.w, 33);
});

QUnit.test('Object.defineProperties.sham flag', assert => {
  assert.same(defineProperties.sham, DESCRIPTORS ? undefined : true);
});
