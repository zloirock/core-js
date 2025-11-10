import { createIterator } from '../helpers/helpers.js';

import Iterator from '@core-js/pure/full/iterator';
import Symbol from '@core-js/pure/es/symbol';

QUnit.test('Iterator#join', assert => {
  const { join } = Iterator.prototype;

  assert.isFunction(join);
  assert.arity(join, 1);
  assert.name(join, 'join');
  assert.nonEnumerable(Iterator.prototype, 'join');

  const observableReturn = {
    return() {
      this.called = true;
      return { done: true, value: undefined };
    },
  };

  const itObservable1 = createIterator([1, 2, 3], observableReturn);
  assert.strictEqual(join.call(itObservable1), '1,2,3', 'without separator attribute');
  assert.true(itObservable1.called, 'iterator closes');
  assert.strictEqual(join.call(createIterator([1, 2, 3]), '-'), '1-2-3', 'with separator attribute');
  assert.strictEqual(join.call(createIterator([1, null, 3]), '-'), '1--3', 'skips nullish values');
  assert.strictEqual(join.call(createIterator([1, undefined, 3]), '-'), '1--3', 'skips undefined values');
  assert.strictEqual(join.call(createIterator([])), '', 'empty iterator');

  assert.throws(() => join.call(''), TypeError, 'iterable non-object this');
  assert.throws(() => join.call(undefined), TypeError, 'non-iterable-object this #1');
  assert.throws(() => join.call(null), TypeError, 'non-iterable-object this #2');
  assert.throws(() => join.call(5), TypeError, 'non-iterable-object this #3');

  const symbol = Symbol('a');
  const itObservable2 = createIterator([1, 2, 3], observableReturn);
  assert.throws(() => join.call(itObservable2, symbol), TypeError, 'throws on symbol separator');
  assert.true(itObservable2.called, 'iterator closes on argument validation error');

  const itObservable3 = createIterator([1, symbol, 3], observableReturn);
  assert.throws(() => join.call(itObservable3), TypeError, 'throws on non-stringable value');
  assert.true(itObservable3.called, 'iterator closes on value conversion error');
});
