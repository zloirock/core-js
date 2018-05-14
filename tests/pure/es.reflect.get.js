import { DESCRIPTORS } from '../helpers/constants';

import get from 'core-js-pure/features/reflect/get';
import { defineProperty, create } from 'core-js-pure/features/object';

QUnit.test('Reflect.get', assert => {
  assert.isFunction(get);
  if ('name' in get) {
    assert.name(get, 'get');
  }
  assert.strictEqual(get({ qux: 987 }, 'qux'), 987);
  if (DESCRIPTORS) {
    const target = create(defineProperty({ z: 3 }, 'w', {
      get() {
        return this;
      },
    }), {
      x: {
        value: 1,
      },
      y: {
        get() {
          return this;
        },
      },
    });
    const receiver = {};
    assert.strictEqual(get(target, 'x', receiver), 1, 'get x');
    assert.strictEqual(get(target, 'y', receiver), receiver, 'get y');
    assert.strictEqual(get(target, 'z', receiver), 3, 'get z');
    assert.strictEqual(get(target, 'w', receiver), receiver, 'get w');
    assert.strictEqual(get(target, 'u', receiver), undefined, 'get u');
  }
  assert.throws(() => get(42, 'constructor'), TypeError, 'throws on primitive');
});
