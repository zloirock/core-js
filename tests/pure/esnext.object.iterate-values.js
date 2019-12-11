import iterateValues from 'core-js-pure/features/object/iterate-values';
import TO_STRING_TAG from 'core-js-pure/features/symbol/to-string-tag';

QUnit.test('Object.iterateValues', assert => {
  assert.isFunction(iterateValues);
  assert.name(iterateValues, 'iterateValues');
  assert.arity(iterateValues, 1);

  const object = {
    q: 1,
    w: 2,
    e: 3,
  };
  const iterator = iterateValues(object);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[TO_STRING_TAG], 'Object Iterator');
  assert.deepEqual(iterator.next(), {
    value: 1,
    done: false,
  });
  delete object.w;
  assert.deepEqual(iterator.next(), {
    value: 3,
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
});
