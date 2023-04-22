import { NODE } from '../helpers/constants';

QUnit.test('URL.canParse', assert => {
  const { canParse } = URL;

  assert.isFunction(canParse);
  assert.arity(canParse, 1);
  assert.name(canParse, 'canParse');
  if (!NODE) assert.looksNative(canParse);

  assert.false(canParse(undefined), 'undefined');
  assert.false(canParse(undefined, undefined), 'undefined, undefined');
  assert.true(canParse('q:w'), 'q:w');
  assert.true(canParse('q:w', undefined), 'q:w, undefined');
  assert.false(canParse(undefined, 'q:w'), 'undefined, q:w');
  assert.true(canParse('q:/w'), 'q:/w');
  assert.true(canParse('q:/w', undefined), 'q:w, undefined');
  assert.true(canParse(undefined, 'q:/w'), 'undefined, q:w');
  assert.false(canParse('https://login:password@examp:le.com:8080/?a=1&b=2&a=3&c=4#fragment'), 'https://login:password@examp:le.com:8080/?a=1&b=2&a=3&c=4#fragment');
  assert.true(canParse('https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment'), 'https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment');
  assert.true(canParse('https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment', undefined), 'https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment, undefined');
  assert.true(canParse('x', 'https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment'), 'x, https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment');

  assert.throws(() => canParse(), 'no args');
  assert.throws(() => canParse({ toString() { throw Error('thrower'); } }), 'conversion thrower #1');
  assert.throws(() => canParse('q:w', { toString() { throw Error('thrower'); } }), 'conversion thrower #2');
});
