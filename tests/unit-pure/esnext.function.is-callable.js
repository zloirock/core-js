import isCallable from '@core-js/pure/full/function/is-callable';
import { fromSource } from '../helpers/helpers.js';

QUnit.test('Function.isCallable', assert => {
  assert.isFunction(isCallable);
  assert.arity(isCallable, 1);
  assert.name(isCallable, 'isCallable');
  assert.false(isCallable({}), 'object');
  assert.false(isCallable(function () {
    // eslint-disable-next-line prefer-rest-params -- required for testing
    return arguments;
  }()), 'arguments');
  assert.false(isCallable([]), 'array');
  assert.false(isCallable(/./), 'regex');
  assert.false(isCallable(1), 'number');
  assert.false(isCallable(true), 'boolean');
  assert.false(isCallable('1'), 'string');
  assert.false(isCallable(null), 'null');
  assert.false(isCallable(), 'undefined');
  assert.true(isCallable(Function.call), 'native function');
  // eslint-disable-next-line prefer-arrow-callback -- required
  assert.true(isCallable(function () { /* empty */ }), 'function');

  const arrow = fromSource('it => it');
  if (arrow) assert.true(isCallable(arrow), 'arrow');
  const klass = fromSource('class {}');
  // Safari 9 and Edge 13- bugs
  if (klass && !/constructor|function/.test(klass)) assert.false(isCallable(klass), 'class');
  const gen = fromSource('function * () {}');
  if (gen) assert.true(isCallable(gen), 'gen');
  const asyncFunc = fromSource('async function () {}');
  if (asyncFunc) assert.true(isCallable(asyncFunc), 'asyncFunc');
  const asyncGen = fromSource('async * function () {}');
  if (asyncGen) assert.true(isCallable(asyncGen), 'asyncGen');
  const method = fromSource('({f(){}}).f');
  // Safari 9 bug
  if (method && !/function/.test(method)) assert.true(isCallable(method), 'method');
});
