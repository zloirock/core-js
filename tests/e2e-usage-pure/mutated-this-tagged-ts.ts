import { restoreProperty } from '../helpers/restore-property.cjs';

// The erased TypeScript this parameter must not shift the runtime namespace argument.
QUnit.test('erased this mutation: tagged call', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Reflect, 'ownKeys');
  function install(this: void, strings: TemplateStringsArray | string[], namespace: any) {
    namespace.ownKeys = () => ['patched'];
  }
  try {
    install`${ Reflect }`;
    assert.deepEqual(Reflect.ownKeys({ value: 1 }), ['patched']);
  } finally {
    restoreProperty(Reflect, 'ownKeys', descriptor);
  }
});
