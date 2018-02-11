import { GLOBAL } from '../helpers/constants';
import { includes } from '../helpers/helpers';

import getOwnPropertyNames from 'core-js-pure/features/object/get-own-property-names';

QUnit.test('Object.getOwnPropertyNames', assert => {
  assert.isFunction(getOwnPropertyNames);
  assert.arity(getOwnPropertyNames, 1);
  function F1() {
    this.w = 1;
  }
  function F2() {
    this.toString = 1;
  }
  F1.prototype.q = F2.prototype.q = 1;
  const names = getOwnPropertyNames([1, 2, 3]);
  assert.strictEqual(names.length, 4);
  assert.ok(includes(names, '0'));
  assert.ok(includes(names, '1'));
  assert.ok(includes(names, '2'));
  assert.ok(includes(names, 'length'));
  assert.deepEqual(getOwnPropertyNames(new F1()), ['w']);
  assert.deepEqual(getOwnPropertyNames(new F2()), ['toString']);
  assert.ok(includes(getOwnPropertyNames(Array.prototype), 'toString'));
  assert.ok(includes(getOwnPropertyNames(Object.prototype), 'toString'));
  assert.ok(includes(getOwnPropertyNames(Object.prototype), 'constructor'));
  const primitives = [42, 'foo', false];
  for (const value of primitives) {
    assert.notThrows(() => getOwnPropertyNames(value), `accept ${ typeof value }`);
  }
  assert.throws(() => getOwnPropertyNames(null), TypeError, 'throws on null');
  assert.throws(() => getOwnPropertyNames(undefined), TypeError, 'throws on undefined');
  if (GLOBAL.document) {
    assert.notThrows(() => {
      const iframe = document.createElement('iframe');
      iframe.src = 'http://example.com';
      document.documentElement.appendChild(iframe);
      const window = iframe.contentWindow;
      document.documentElement.removeChild(iframe);
      return getOwnPropertyNames(window);
    }, 'IE11 bug with iframe and window');
  }
});
