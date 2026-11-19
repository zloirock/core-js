// Self-reading writes preserve the live family and effect order across repeated type questions.
QUnit.test('receiver queries: cyclic normalization', assert => {
  function read(input, flag, replacement) {
    const log = [];
    function next(value) {
      log.push(value.length);
      return replacement;
    }
    let value = input;
    value = flag ? value : next(value);
    value = !flag ? value : next(value);
    try {
      return [value.at((log.push('argument'), -1)), log];
    } catch (error) {
      return [error.name, log];
    }
  }
  assert.deepEqual(read([3, 7], true, 'cd'), ['d', [2, 'argument']]);
  assert.deepEqual(read('ab', false, [5, 9]), [9, [2, 'argument']]);
});

QUnit.test('receiver queries: deferred read sees completed writes', assert => {
  function read(flag) {
    let value = [3, 7];
    function last() { return value.at(-1); }
    if (flag) value = 'ab';
    return last();
  }
  assert.same(read(false), 7);
  assert.same(read(true), 'b');
});
