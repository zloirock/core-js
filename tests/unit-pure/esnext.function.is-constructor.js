import isConstructor from '@core-js/pure/full/function/is-constructor';
import { GLOBAL } from '../helpers/constants.js';
import { fromSource } from '../helpers/helpers.js';

QUnit.test('Function.isConstructor', assert => {
  assert.isFunction(isConstructor);
  assert.arity(isConstructor, 1);
  assert.name(isConstructor, 'isConstructor');
  assert.false(isConstructor({}), 'object');
  assert.false(isConstructor(function () {
    // eslint-disable-next-line prefer-rest-params -- required for testing
    return arguments;
  }()), 'arguments');
  assert.false(isConstructor([]), 'array');
  assert.false(isConstructor(/./), 'regex');
  assert.false(isConstructor(1), 'number');
  assert.false(isConstructor(true), 'boolean');
  assert.false(isConstructor('1'), 'string');
  assert.false(isConstructor(null), 'null');
  assert.false(isConstructor(), 'undefined');
  // assert.false(isConstructor(Function.call), 'native function'); // fails in some old engines
  // eslint-disable-next-line prefer-arrow-callback -- required
  assert.true(isConstructor(function () { /* empty */ }), 'function');

  const arrow = fromSource('it => it');
  if (arrow) assert.false(isConstructor(arrow), 'arrow');
  const klass = fromSource('class {}');
  // Safari 9 and Edge 13- bugs
  if (klass && !/constructor|function/.test(klass)) assert.true(isConstructor(klass), 'class');
  const Gen = fromSource('function * () {}');
  // V8 ~ Chrome 49- bug
  if (Gen) try {
    new Gen();
  } catch {
    assert.false(isConstructor(Gen), 'gen');
  }
  const asyncFunc = fromSource('async function () {}');
  if (asyncFunc) assert.false(isConstructor(asyncFunc), 'asyncFunc');
  const asyncGen = fromSource('async function* () {}');
  if (asyncGen) assert.false(isConstructor(asyncGen), 'asyncGen');
  const method = fromSource('({f(){}}).f');
  // Safari 9 bug
  if (method && !/function/.test(method)) assert.false(isConstructor(method), 'method');

  // The legacy sham cannot inspect proxy constructors reliably.
  const { Proxy } = GLOBAL;
  if (typeof Proxy == 'function' && !isConstructor.sham) {
    // Chakra and a preloaded Reflect.construct sham can read newTarget.prototype.
    const proxyAssert = GLOBAL.Reflect?.construct?.sham || /Edge\//.test(GLOBAL.navigator?.userAgent) || GLOBAL.process?.versions?.chakracore
      ? assert.skip : assert;
    const calls = [];
    const constructor = function () { assert.avoid('constructor must not be called'); };
    const logging = new Proxy(constructor, {
      get(target, key) {
        calls.push(key);
        return target[key];
      },
    });
    assert.true(isConstructor(logging), 'proxy constructor');
    proxyAssert.arrayEqual(calls, [], 'does not read properties of the constructor');
    calls.length = 0;
    const nonConstructor = new Proxy(Function.prototype.call, { get() { calls.push('get'); } });
    assert.false(isConstructor(nonConstructor), 'proxy non-constructor');
    proxyAssert.arrayEqual(calls, [], 'does not read properties of a non-constructor');

    const fail = () => { throw new Error('proxy trap'); };
    proxyAssert.true(isConstructor(new Proxy(constructor, { get: fail, apply: fail, construct: fail })), 'does not invoke proxy traps');
    assert.false(isConstructor(new Proxy(Function.prototype.call, { get: fail, construct: fail })), 'construct trap does not make a non-constructor constructible');

    if (typeof Proxy.revocable == 'function') {
      for (const [target, expected] of [[constructor, true], [Function.prototype.call, false], [{}, false]]) {
        const { proxy, revoke } = Proxy.revocable(target, {});
        revoke();
        (expected ? proxyAssert : assert).same(isConstructor(proxy), expected, 'revocation preserves constructibility');
      }
    }
  }
});
