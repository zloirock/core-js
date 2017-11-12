import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Object.getOwnPropertyDescriptors', function (assert) {
  var Symbol = core.Symbol;
  var create = core.Object.create;
  var getOwnPropertyDescriptors = core.Object.getOwnPropertyDescriptors;
  assert.isFunction(getOwnPropertyDescriptors);
  var object = create({ q: 1 }, { e: { value: 3 } });
  object.w = 2;
  var symbol = Symbol('4');
  object[symbol] = 4;
  var descriptors = getOwnPropertyDescriptors(object);
  assert.strictEqual(descriptors.q, undefined);
  assert.deepEqual(descriptors.w, {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 2
  });
  if (DESCRIPTORS) {
    assert.deepEqual(descriptors.e, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: 3
    });
  } else {
    assert.deepEqual(descriptors.e, {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 3
    });
  }
  assert.strictEqual(descriptors[symbol].value, 4);
});
