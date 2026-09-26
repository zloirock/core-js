/* eslint-disable prefer-const -- assignment wrappers are the syntax under test */
QUnit.test('wrapped computed keys preserve call and getter order', assert => {
  const events = [];
  function mark(tag, value) {
    events.push(tag);
    return value;
  }
  let at, tail, flat;
  [{ [(mark('k'), 'at')]: at }, tail] = [mark('r', Array.prototype), 7];
  [{ [(mark('s'), 'flat')]: flat }] = [mark('e', Array.prototype)];
  assert.same(at.call([3, 4], -1), 4);
  assert.deepEqual(flat.call([1, [2]]), [1, 2]);
  assert.same(tail, 7);
  assert.deepEqual(events, ['r', 'k', 'e', 's']);
  function read(input) {
    let method, beside;
    [{ [(mark('key'), 'at')]: method }, beside] = [mark('receiver', input), 8];
    return [method, beside];
  }
  const own = { get at() {
    events.push('get');
    return 9;
  } };
  assert.deepEqual(read(own), [9, 8]);
  assert.same(read(Array.prototype)[0].call([3, 4], -1), 4);
  assert.deepEqual(events, ['r', 'k', 'e', 's', 'receiver', 'key', 'get', 'receiver', 'key']);
});
