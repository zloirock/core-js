import { STRICT } from '../helpers/constants';

QUnit.test('Object#__lookupSetter__', assert => {
  const { __lookupSetter__ } = Object.prototype;
  const { create } = Object;
  assert.isFunction(__lookupSetter__);
  assert.arity(__lookupSetter__, 1);
  assert.name(__lookupSetter__, '__lookupSetter__');
  assert.looksNative(__lookupSetter__);
  assert.nonEnumerable(Object.prototype, '__lookupSetter__');
  assert.same({}.__lookupSetter__('key'), undefined, 'empty object');
  assert.same({ key: 42 }.__lookupSetter__('key'), undefined, 'data descriptor');
  const object = {};
  function setter() { /* empty */ }
  object.__defineSetter__('key', setter);
  assert.same(object.__lookupSetter__('key'), setter, 'own getter');
  assert.same(create(object).__lookupSetter__('key'), setter, 'proto getter');
  assert.same(create(object).__lookupSetter__('foo'), undefined, 'empty proto');
  if (STRICT) {
    assert.throws(() => __lookupSetter__.call(null, 1, () => { /* empty */ }), TypeError, 'Throws on null as `this`');
    assert.throws(() => __lookupSetter__.call(undefined, 1, () => { /* empty */ }), TypeError, 'Throws on undefined as `this`');
  }
});
