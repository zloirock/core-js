import { STRICT } from '../helpers/constants';

import { __defineGetter__, __defineSetter__ } from 'core-js-pure/full/object';

QUnit.test('Object#__defineGetter__', assert => {
  assert.isFunction(__defineGetter__);
  const object = {};
  assert.same(__defineGetter__(object, 'key', () => 42), undefined, 'void');
  assert.same(object.key, 42, 'works');
  __defineSetter__(object, 'key', function () {
    this.foo = 43;
  });
  object.key = 44;
  assert.ok(object.key === 42 && object.foo === 43, 'works with setter');
  if (STRICT) {
    assert.throws(() => __defineGetter__(null, 1, () => { /* empty */ }), TypeError, 'Throws on null as `this`');
    assert.throws(() => __defineGetter__(undefined, 1, () => { /* empty */ }), TypeError, 'Throws on undefined as `this`');
  }
});
