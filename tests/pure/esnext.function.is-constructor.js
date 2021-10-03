import isConstructor from 'core-js-pure/features/function/is-constructor';
import { fromSource } from '../helpers/helpers';

QUnit.test('Function.isConstructor', assert => {
  assert.isFunction(isConstructor);
  assert.arity(isConstructor, 1);
  assert.name(isConstructor, 'isConstructor');
  assert.ok(!isConstructor({}), 'object');
  assert.ok(!isConstructor(function () {
    return arguments;
  }()), 'arguments');
  assert.ok(!isConstructor([]), 'array');
  assert.ok(!isConstructor(/./), 'regex');
  assert.ok(!isConstructor(1), 'number');
  assert.ok(!isConstructor(true), 'boolean');
  assert.ok(!isConstructor('1'), 'string');
  assert.ok(!isConstructor(null), 'null');
  assert.ok(!isConstructor(), 'undefined');
  // assert.ok(!isConstructor(Function.call), 'native function'); // fails in some old engines
  // eslint-disable-next-line prefer-arrow-callback -- required
  assert.ok(isConstructor(function () { /* empty */ }), 'function');

  const arrow = fromSource('it => it');
  if (arrow) assert.ok(!isConstructor(arrow), 'arrow');
  const klass = fromSource('class {}');
  if (klass) assert.ok(isConstructor(klass), 'class');
  const gen = fromSource('function * () {}');
  if (gen) assert.ok(!isConstructor(gen), 'gen');
  const asyncFunc = fromSource('async function () {}');
  if (asyncFunc) assert.ok(!isConstructor(asyncFunc), 'asyncFunc');
  const asyncGen = fromSource('async * function () {}');
  if (asyncGen) assert.ok(!isConstructor(asyncGen), 'asyncGen');
  const method = fromSource('({f(){}}).f');
  if (method) assert.ok(!isConstructor(method), 'method');
});
