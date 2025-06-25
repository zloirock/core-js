import URL from '@core-js/pure/stable/url';
import parse from '@core-js/pure/stable/url/parse';

QUnit.test('URL.parse', assert => {
  assert.isFunction(parse);
  assert.arity(parse, 1);
  assert.name(parse, 'parse');

  assert.same(parse(undefined), null, 'undefined');
  assert.same(parse(undefined, undefined), null, 'undefined, undefined');
  assert.deepEqual(parse('q:w'), new URL('q:w'), 'q:w');
  assert.deepEqual(parse('q:w', undefined), new URL('q:w'), 'q:w, undefined');
  assert.deepEqual(parse('q:/w'), new URL('q:/w'), 'q:/w');
  assert.deepEqual(parse('q:/w', undefined), new URL('q:/w', undefined), 'q:/w, undefined');
  assert.deepEqual(parse(undefined, 'q:/w'), new URL(undefined, 'q:/w'), 'undefined, q:/w');
  assert.same(parse('https://login:password@examp:le.com:8080/?a=1&b=2&a=3&c=4#fragment'), null, 'https://login:password@examp:le.com:8080/?a=1&b=2&a=3&c=4#fragment');
  assert.deepEqual(parse('https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment'), new URL('https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment'), 'https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment');
  assert.deepEqual(parse('https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment', undefined), new URL('https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment', undefined), 'https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment, undefined');
  // eslint-disable-next-line unicorn/relative-url-style -- required for testing
  assert.deepEqual(parse('x', 'https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment'), new URL('x', 'https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment'), 'x, https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment');

  assert.throws(() => parse(), 'no args');
  assert.throws(() => parse({ toString() { throw new Error('thrower'); } }), 'conversion thrower #1');
  assert.throws(() => parse('q:w', { toString() { throw new Error('thrower'); } }), 'conversion thrower #2');
});
