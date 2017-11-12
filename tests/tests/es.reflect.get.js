import { DESCRIPTORS, NATIVE } from '../helpers/constants';

QUnit.test('Reflect.get', function (assert) {
  var defineProperty = Object.defineProperty;
  var create = Object.create;
  var get = Reflect.get;
  assert.isFunction(get);
  if (NATIVE) assert.arity(get, 2);
  assert.name(get, 'get');
  assert.looksNative(get);
  assert.nonEnumerable(Reflect, 'get');
  assert.strictEqual(get({ qux: 987 }, 'qux'), 987);
  if (DESCRIPTORS) {
    var target = create(defineProperty({ z: 3 }, 'w', {
      get: function () {
        return this;
      }
    }), {
      x: {
        value: 1
      },
      y: {
        get: function () {
          return this;
        }
      }
    });
    var receiver = {};
    assert.strictEqual(get(target, 'x', receiver), 1, 'get x');
    assert.strictEqual(get(target, 'y', receiver), receiver, 'get y');
    assert.strictEqual(get(target, 'z', receiver), 3, 'get z');
    assert.strictEqual(get(target, 'w', receiver), receiver, 'get w');
    assert.strictEqual(get(target, 'u', receiver), undefined, 'get u');
  }
  assert['throws'](function () {
    get(42, 'constructor');
  }, TypeError, 'throws on primitive');
});

