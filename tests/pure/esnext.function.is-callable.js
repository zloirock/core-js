import isCallable from 'core-js-pure/features/function/is-callable';
import { fromSource } from '../helpers/helpers';

QUnit.test('Function.isCallable', assert => {
  assert.isFunction(isCallable);
  assert.arity(isCallable, 1);
  assert.name(isCallable, 'isCallable');
  assert.ok(!isCallable({}), 'object');
  assert.ok(!isCallable(function () {
    return arguments;
  }()), 'arguments');
  assert.ok(!isCallable([]), 'array');
  assert.ok(!isCallable(/./), 'regex');
  assert.ok(!isCallable(1), 'number');
  assert.ok(!isCallable(true), 'boolean');
  assert.ok(!isCallable('1'), 'string');
  assert.ok(!isCallable(null), 'null');
  assert.ok(!isCallable(), 'undefined');
  assert.ok(isCallable(Function.call), 'native function');
  // eslint-disable-next-line prefer-arrow-callback -- required
  assert.ok(isCallable(function () { /* empty */ }), 'function');

  const arrow = fromSource('it => it');
  if (arrow) assert.ok(isCallable(arrow), 'arrow');
  const klass = fromSource('class {}');
  if (klass) assert.ok(!isCallable(klass), 'class');
  const gen = fromSource('function * () {}');
  if (gen) assert.ok(isCallable(gen), 'gen');
  const asyncFunc = fromSource('async function () {}');
  if (asyncFunc) assert.ok(isCallable(asyncFunc), 'asyncFunc');
  const asyncGen = fromSource('async * function () {}');
  if (asyncGen) assert.ok(isCallable(asyncGen), 'asyncGen');
  const method = fromSource('({f(){}}).f');
  if (method) assert.ok(isCallable(method), 'method');
});
