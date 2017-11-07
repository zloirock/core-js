var test = QUnit.test;

test('Array#fill', function (assert) {
  var fill = Array.prototype.fill;
  assert.isFunction(fill);
  assert.arity(fill, 1);
  assert.name(fill, 'fill');
  assert.looksNative(fill);
  assert.nonEnumerable(Array.prototype, 'fill');
  var array = new Array(5);
  assert.strictEqual(array.fill(5), array);
  assert.deepEqual(Array(5).fill(5), [5, 5, 5, 5, 5]);
  assert.deepEqual(Array(5).fill(5, 1), [undefined, 5, 5, 5, 5]);
  assert.deepEqual(Array(5).fill(5, 1, 4), [undefined, 5, 5, 5, undefined]);
  assert.deepEqual(Array(5).fill(5, 6, 1), [undefined, undefined, undefined, undefined, undefined]);
  assert.deepEqual(Array(5).fill(5, -3, 4), [undefined, undefined, 5, 5, undefined]);
  if (STRICT) {
    assert['throws'](function () {
      return fill.call(null, 0);
    }, TypeError);
    assert['throws'](function () {
      return fill.call(undefined, 0);
    }, TypeError);
  }
  if (NATIVE && DESCRIPTORS) {
    assert.ok(function () {
      try {
        return fill.call(Object.defineProperty({
          length: -1
        }, 0, {
          set: function () {
            throw Error();
          }
        }));
      } catch (e) { /* empty */ }
    }(), 'uses ToLength');
  }
  assert.ok('fill' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
