import { GLOBAL } from '../helpers/constants';

import { slice, isArray } from 'core-js-pure/features/array';

QUnit.test('Array#slice', assert => {
  assert.isFunction(slice);
  const array = ['1', '2', '3', '4', '5'];
  assert.deepEqual(slice(array), array);
  assert.deepEqual(slice(array, 1, 3), ['2', '3']);
  assert.deepEqual(slice(array, 1, undefined), ['2', '3', '4', '5']);
  assert.deepEqual(slice(array, 1, -1), ['2', '3', '4']);
  assert.deepEqual(slice(array, -2, -1), ['4']);
  assert.deepEqual(slice(array, -2, -3), []);
  const string = '12345';
  assert.deepEqual(slice(string), array);
  assert.deepEqual(slice(string, 1, 3), ['2', '3']);
  assert.deepEqual(slice(string, 1, undefined), ['2', '3', '4', '5']);
  assert.deepEqual(slice(string, 1, -1), ['2', '3', '4']);
  assert.deepEqual(slice(string, -2, -1), ['4']);
  assert.deepEqual(slice(string, -2, -3), []);
  const list = GLOBAL.document && document.body && document.body.childNodes;
  if (list) {
    assert.notThrows(() => isArray(slice(list)), 'works with NodeList');
  }
});
