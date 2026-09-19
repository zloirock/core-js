import { restoreProperty } from '../../helpers/restore-property.cjs';

// These constructors have static namespaces in pure, but those namespaces are not callable.
// A user-installed static must stay on the native constructor so call, new and identity survive.
QUnit.test('mutated native constructors: parameter writes keep callable identity', assert => {
  const objectDescriptor = Object.getOwnPropertyDescriptor(Object, 'fromEntries');
  const stringDescriptor = Object.getOwnPropertyDescriptor(String, 'raw');
  const arrayDescriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  try {
    function installObject(target) { target.fromEntries = () => 'object patch'; }
    function installString(target) { target.raw = () => 'string patch'; }
    function installArray(target) { target.from = () => ['array patch']; }
    installObject(Object);
    installString(String);
    installArray(Array);
    assert.same(Object.fromEntries([]), 'object patch');
    assert.same(String.raw({ raw: ['x'] }), 'string patch');
    assert.deepEqual(Array.from([]), ['array patch']);
    assert.same(Object, {}.constructor);
    assert.same(String, ''.constructor);
    assert.same(Array, [].constructor);
    assert.same(Object(1).valueOf(), 1);
    assert.same(String(2), '2');
    assert.same(Array(3).length, 3);
    const ObjectConstructor = Object;
    const StringConstructor = String;
    const ArrayConstructor = Array;
    assert.same(new ObjectConstructor(4).valueOf(), 4);
    assert.same(new StringConstructor(5).valueOf(), '5');
    assert.same(new ArrayConstructor(6).length, 6);
  } finally {
    restoreProperty(Object, 'fromEntries', objectDescriptor);
    restoreProperty(String, 'raw', stringDescriptor);
    restoreProperty(Array, 'from', arrayDescriptor);
  }
});
