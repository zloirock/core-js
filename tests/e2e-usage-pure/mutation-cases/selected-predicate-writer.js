import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('a method selected from this can replace the array predicate', assert => {
  function run() {
    const write = (this && this.write) || (value => value);
    write(Array, 'isArray', value => typeof value === 'string');
    function has(value) { return Array.isArray(value) && value.includes('ab'); }
    return [has('cab'), has(['ab'])];
  }
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'isArray');
  let result;
  try {
    result = run.call({ write: Reflect.set });
  } finally {
    restoreProperty(Array, 'isArray', descriptor);
  }
  assert.deepEqual(result, [true, false]);
});
