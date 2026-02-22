import { fromSource } from '../helpers/helpers.js';

QUnit.test('Function.isConstructor', assert => {
  const { isConstructor } = Function;
  assert.isFunction(isConstructor);
  assert.arity(isConstructor, 1);
  assert.name(isConstructor, 'isConstructor');
  assert.looksNative(isConstructor);
  assert.nonEnumerable(Function, 'isConstructor');
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
});
