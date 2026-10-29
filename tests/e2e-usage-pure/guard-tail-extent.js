import { restoreProperty } from '../helpers/restore-property.cjs';

QUnit.test('global-proxy: guarded tails preserve getter, argument and receiver order', assert => {
  const realm = Function('return this')();
  const saved = Object.getOwnPropertyDescriptor(realm, 'guardTailBox');
  const events = [];
  const box = { get read() {
    events.push('get');
    return function (value) {
      events.push(this === box ? 'this' : 'lost');
      return { value };
    };
  } };
  realm.guardTailBox = box;
  function argument() {
    events.push('arg');
    return Array.of(3)[0];
  }
  function observe(read) {
    events.length = 0;
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    return [value, events.slice()];
  }
  try {
    const native = Function('realm', 'argument',
      'var root = realm.window; if (root == null) return; var box = root.self.guardTailBox;'
      + 'var read = box.read; if (read == null) return; return read.call(box, argument()).value;');
    assert.deepEqual(observe(() => globalThis.window?.self.guardTailBox.read?.(argument()).value),
      observe(() => native(realm, argument)));
    const keyed = Function('realm', 'argument',
      'var root = realm.window; if (root == null) return; var base = root.self; argument();'
      + 'return base.window.guardTailBox.read(3).value;');
    // eslint-disable-next-line no-sequences -- the key effect must stay behind the source guard
    assert.deepEqual(observe(() => globalThis.window?.self[argument(), 'window'].guardTailBox.read(3).value),
      observe(() => keyed(realm, argument)));
    const sealed = Function('realm', 'argument',
      'var root = realm.window, box = root == null ? undefined : root.self.guardTailBox;'
      + 'var read = root == null ? undefined : box.read, value = argument(); return read.call(box, value).value;');
    // eslint-disable-next-line no-unsafe-optional-chaining -- the seal must still evaluate the argument and throw
    assert.deepEqual(observe(() => (globalThis.window?.self.guardTailBox.read)(argument()).value),
      observe(() => sealed(realm, argument)));
  } finally {
    restoreProperty(realm, 'guardTailBox', saved);
  }
});
