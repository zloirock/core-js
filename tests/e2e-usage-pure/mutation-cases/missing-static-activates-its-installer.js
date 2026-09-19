import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('mutated native constructors: missing static activates its installer', assert => {
  const objectDescriptor = Object.getOwnPropertyDescriptor(Object, 'fromEntries');
  const stringDescriptor = Object.getOwnPropertyDescriptor(String, 'raw');
  const arrayDescriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  try {
    delete Object.fromEntries;
    delete String.raw;
    delete Array.from;
    if (!Object.fromEntries) Object.fromEntries = () => 'object shim';
    if (!String.raw) String.raw = () => 'string shim';
    if (!Array.from) Array.from = () => ['array shim'];
    assert.same(Object.fromEntries([]), 'object shim');
    assert.same(String.raw({ raw: ['x'] }), 'string shim');
    assert.deepEqual(Array.from([]), ['array shim']);
    assert.same(typeof Object, 'function');
    assert.same(typeof String, 'function');
    assert.same(typeof Array, 'function');
  } finally {
    restoreProperty(Object, 'fromEntries', objectDescriptor);
    restoreProperty(String, 'raw', stringDescriptor);
    restoreProperty(Array, 'from', arrayDescriptor);
  }
});
