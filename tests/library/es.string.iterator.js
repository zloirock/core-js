QUnit.test('String#@@iterator', function (assert) {
  var iter = core.getIterator('qwe');
  var Symbol = core.Symbol;
  assert.isIterator(iter);
  assert.strictEqual(iter[Symbol.toStringTag], 'String Iterator');
  assert.deepEqual(iter.next(), {
    value: 'q',
    done: false
  });
  assert.deepEqual(iter.next(), {
    value: 'w',
    done: false
  });
  assert.deepEqual(iter.next(), {
    value: 'e',
    done: false
  });
  assert.deepEqual(iter.next(), {
    value: undefined,
    done: true
  });
  assert.strictEqual(core.Array.from('𠮷𠮷𠮷').length, 3);
  iter = core.getIterator('𠮷𠮷𠮷');
  assert.deepEqual(iter.next(), {
    value: '𠮷',
    done: false
  });
  assert.deepEqual(iter.next(), {
    value: '𠮷',
    done: false
  });
  assert.deepEqual(iter.next(), {
    value: '𠮷',
    done: false
  });
  assert.deepEqual(iter.next(), {
    value: undefined,
    done: true
  });
});
