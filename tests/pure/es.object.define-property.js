import { DESCRIPTORS } from '../helpers/constants';

import { defineProperty, create } from 'core-js-pure/features/object';

QUnit.test('Object.defineProperty', assert => {
  assert.isFunction(defineProperty);
  assert.arity(defineProperty, 3);
  const source = {};
  const result = defineProperty(source, 'q', {
    value: 42,
  });
  assert.same(result, source);
  assert.same(result.q, 42);
  assert.throws(() => defineProperty(42, 1, {}));
  assert.throws(() => defineProperty({}, create(null), {}));
  assert.throws(() => defineProperty({}, 1, 1));
});

QUnit.test('Object.defineProperty.sham flag', assert => {
  assert.same(defineProperty.sham, DESCRIPTORS ? undefined : true);
});
