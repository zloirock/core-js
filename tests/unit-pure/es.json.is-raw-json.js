import isRawJSON from '@core-js/pure/es/json/is-raw-json';
import rawJSON from '@core-js/pure/es/json/raw-json';
import freeze from '@core-js/pure/es/object/freeze';
import Symbol from '@core-js/pure/es/symbol';

QUnit.test('JSON.isRawJSON', assert => {
  assert.isFunction(isRawJSON);
  assert.arity(isRawJSON, 1);
  assert.name(isRawJSON, 'isRawJSON');

  assert.true(isRawJSON(rawJSON(1)), 'raw1');
  assert.true(isRawJSON(rawJSON(null)), 'raw2');
  assert.false(isRawJSON(freeze({ rawJSON: '123' })), 'fake');
  assert.false(isRawJSON(undefined), 'undefined');
  assert.false(isRawJSON(null), 'null');
  assert.false(isRawJSON(1), 'number');
  assert.false(isRawJSON('qwe'), 'string');
  assert.false(isRawJSON(true), 'bool');
  assert.false(isRawJSON(Symbol('JSON.isRawJSON test')), 'sym');
  assert.false(isRawJSON({}), 'object');
  assert.false(isRawJSON([]), 'array');
});
