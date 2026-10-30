import { NODE, DENO } from '../helpers/constants.js';

QUnit.test('URL.canParse', assert => {
  const { canParse } = URL;

  assert.isFunction(canParse);
  assert.arity(canParse, 1);
  assert.name(canParse, 'canParse');
  // Deno 1.x implements this API in JavaScript without native-looking source strings.
  if (!NODE && !DENO) assert.looksNative(canParse);

  assert.false(canParse(undefined), 'undefined');
  assert.false(canParse(undefined, undefined), 'undefined, undefined');
  assert.true(canParse('q:w'), 'q:w');
  assert.true(canParse('q:w', undefined), 'q:w, undefined');
  // assert.false(canParse(undefined, 'q:w'), 'undefined, q:w'); // fails in Chromium on Windows
  assert.true(canParse('q:/w'), 'q:/w');
  assert.true(canParse('q:/w', undefined), 'q:/w, undefined');
  // assert.true(canParse(undefined, 'q:/w'), 'undefined, q:/w'); // false in native Firefox 57-68
  assert.true(canParse(undefined, 'https://example.com/'), 'undefined, special base');
  assert.false(canParse('https://login:password@examp:le.com:8080/?a=1&b=2&a=3&c=4#fragment'), 'https://login:password@examp:le.com:8080/?a=1&b=2&a=3&c=4#fragment');
  assert.true(canParse('https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment'), 'https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment');
  assert.true(canParse('https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment', undefined), 'https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment, undefined');
  assert.true(canParse('x', 'https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment'), 'x, https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment');

  assert.throws(() => canParse(), 'no args');

  // assert.false(canParse('http://a\u0001b.example.com/'), 'forbidden domain code point'); // true in Safari 14
  // assert.false(canParse('http://a\uFE6Ab.example.com/'), 'code point mapped onto a forbidden domain code point'); // true in native Firefox 57-66
  assert.false(canParse('http://a\uFE68b.example.com/'), 'code point mapped onto a forbidden domain code point');
  assert.true(canParse('http://a\u00ADb.example.com/'), 'ignored code point in a domain');
  assert.throws(() => canParse({ toString() { throw new Error('thrower'); } }), 'conversion thrower #1');
  assert.throws(() => canParse('q:w', { toString() { throw new Error('thrower'); } }), 'conversion thrower #2');
});
