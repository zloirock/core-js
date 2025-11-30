import create from '@core-js/pure/es/object/create';
import defineProperty from '@core-js/pure/es/object/define-property';
import get from '@core-js/pure/es/reflect/get';

QUnit.test('Reflect.get', assert => {
  assert.isFunction(get);
  if ('name' in get) {
    assert.name(get, 'get');
  }
  assert.same(get({ qux: 987 }, 'qux'), 987);

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
  assert.same(get(target, 'x', receiver), 1, 'get x');
  assert.same(get(target, 'y', receiver), receiver, 'get y');
  assert.same(get(target, 'z', receiver), 3, 'get z');
  assert.same(get(target, 'w', receiver), receiver, 'get w');
  assert.same(get(target, 'u', receiver), undefined, 'get u');

  assert.throws(() => get(42, 'constructor'), TypeError, 'throws on primitive');
});
