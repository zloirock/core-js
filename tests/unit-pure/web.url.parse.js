import URL from 'core-js-pure/stable/url';
import parse from 'core-js-pure/stable/url/parse';

QUnit.test('URL.parse', assert => {
  assert.isFunction(parse);
  assert.arity(parse, 1);
  assert.name(parse, 'parse');
  assert.enumerable(URL, 'parse');

  assert.same(parse(undefined), null, 'undefined');
  assert.same(parse(undefined, undefined), null, 'undefined, undefined');
  assert.deepEqual(parse('q:w'), new URL('q:w'), 'q:w');
  assert.deepEqual(parse('q:w', undefined), new URL('q:w'), 'q:w, undefined');
  assert.deepEqual(parse('q:/w'), new URL('q:/w'), 'q:/w');
  assert.deepEqual(parse('q:/w', undefined), new URL('q:/w', undefined), 'q:/w, undefined');
  // https://github.com/denoland/deno/issues/37104
  assert.deepEqual(parse.call(null, 'q:w'), new URL('q:w'), 'null receiver');
  assert.deepEqual(parse.call(Object, 'q:w'), new URL('q:w'), 'receiver is not used as the constructor');
  assert.deepEqual(parse(undefined, 'q:/w'), new URL(undefined, 'q:/w'), 'undefined, q:/w');
  assert.same(parse('https://login:password@examp:le.com:8080/?a=1&b=2&a=3&c=4#fragment'), null, 'https://login:password@examp:le.com:8080/?a=1&b=2&a=3&c=4#fragment');
  assert.same(parse('http://a\u0001b.example.com/'), null, 'forbidden domain code point');
  assert.same(parse('http://a\uFE6Ab.example.com/'), null, 'code point mapped onto a forbidden domain code point');
  assert.same(parse('http://a\u00ADb.example.com/').hostname, 'ab.example.com', 'ignored code point in a domain');
  assert.deepEqual(parse('https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment'), new URL('https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment'), 'https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment');
  assert.deepEqual(parse('https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment', undefined), new URL('https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment', undefined), 'https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment, undefined');
  // eslint-disable-next-line unicorn/relative-url-style -- required for testing
  assert.deepEqual(parse('x', 'https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment'), new URL('x', 'https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment'), 'x, https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment');

  assert.throws(() => parse(), 'no args');
  assert.throws(() => parse({ toString() { throw new Error('thrower'); } }), 'conversion thrower #1');
  assert.throws(() => parse('q:w', { toString() { throw new Error('thrower'); } }), 'conversion thrower #2');
});

QUnit.test('URL.parse converts lone surrogates before removing tabs and newlines', assert => {
  for (const separator of ['\t', '\n', '\r', '\t\n\r']) {
    const input = `a\uD800${ separator }\uDC00b`;
    assert.same(parse(`http://${ input }/`), null, 'invalid domain');
    assert.same(parse('b', `http://${ input }/`), null, 'invalid base domain');
    assert.same(parse(`http://example.com/${ input }`).pathname, '/a%EF%BF%BD%EF%BF%BDb', 'valid path');
    assert.same(parse('b', `http://example.com/${ input }/`).pathname, '/a%EF%BF%BD%EF%BF%BDb/b', 'base path');
  }
  assert.same(parse('http://example.com/a\uD800\uDC00b').pathname, '/a%F0%90%80%80b', 'surrogate pair is kept');
});
