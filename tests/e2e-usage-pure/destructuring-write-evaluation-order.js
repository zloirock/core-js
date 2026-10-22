/* eslint-disable no-useless-assignment -- every overwritten write is the evaluation order under test */
// A read follows the write that RUNS last, which the source does not always place last: an
// assignment completes after the writes in its own value, and a destructuring host fills its
// pattern - its defaults and computed keys - after its value's sequence prefix, also where the
// rewrite lifts that prefix ahead of the declaration. A module of its own: a write of a name or a
// member slot is contagious for the whole file, so its neighbours here would answer for it.
QUnit.test('write order: an assignment completes after a write in its own value', assert => {
  let list = [1, 2];
  // eslint-disable-next-line no-sequences -- a sequence statement hosts the outer assignment
  list = (list = 'ab', [3]), 0;
  assert.same(list.at(-1), 3);
});

QUnit.test('write order: a pattern default runs after the lifted value prefix', assert => {
  let list = [1, 2];
  const { from, other = list = [3] } = (list = 'ab', Array);
  assert.same(list.at(-1), 3);
  assert.deepEqual([from([4]), other], [[4], [3]]);
});

QUnit.test('write order: a computed key runs after the value prefix it is placed above', assert => {
  let text = 'cd';
  const box = {};
  ({ [(text = 'ef', 'key')]: box.key } = (text = [5], box));
  assert.true(text.includes('e'));
});

QUnit.test('write order: a key the rewrite moves out of the pattern reads after the value prefix', assert => {
  let text = [1, 2];
  let head, from, first;
  // eslint-disable-next-line prefer-const -- the assignment form is the host under test
  ({ from, [(head = text.at(0), 'of')]: first } = (text = 'ab', Array));
  assert.same(head, 'a');
  assert.deepEqual([from([4]), first(5)], [[4], [5]]);
});

QUnit.test('write order: a key the rewrite moves into the extraction writes after the value prefix', assert => {
  let list;
  const { of, [(list = 'cd', 'from')]: make } = (list = [3], Array);
  assert.true(list.includes('c'));
  assert.deepEqual([of(1), make([2])], [[1], [2]]);
});

QUnit.test('write order: a parameter pattern the rewrite re-hosts reads after its default value', assert => {
  let text = [1, 2];
  let head;
  (function ({ from, prototype: { [head = text.at(0)]: missing } } = (text = 'ab', Array)) {
    assert.deepEqual([from([3]), missing], [[3], undefined]);
  })();
  assert.same(head, 'a');
});

QUnit.test('write order: a loop head the rewrite re-hosts reads after the iterated value', assert => {
  let text = [1, 2];
  let head, from, missing;
  for ({ from, [head = text.at(-1)]: missing } of [(text = 'ab', Array)]);
  assert.same(head, 'b');
  assert.deepEqual([from([3]), missing], [[3], undefined]);
});

QUnit.test('write order: a member target takes its key before its default runs', assert => {
  let text = [1];
  const slots = {};
  // eslint-disable-next-line no-sequences -- a write in the target's key is the order under test
  ({ a: slots[text = 'ab', 'k'] = text.at(0) } = {});
  assert.same(slots.k, 'a');
});

QUnit.test('write order: a var initializer runs past an earlier write of its name', assert => {
  text = 'ab';
  const head = text.at(-1);
  // eslint-disable-next-line no-var -- a `var` initializer past an earlier write is the shape under test
  var text = [3, 4];
  assert.deepEqual([head, text.at(-1)], ['b', 4]);
});

QUnit.test('immediate extraction: siblings retain their initialization slots', assert => {
  const events = [];
  const values = [4, 5];
  function source() {
    events.push('source');
    return values;
  }
  const before = (events.push('before'), 0),
        { at: method = (events.push('default'), () => -1), length: size } = source(),
        after = (events.push('after'), method.call(values, -1));
  assert.deepEqual([before, after, size], [0, 5, 2]);
  assert.deepEqual(events, ['before', 'source', 'after']);
});

QUnit.test('immediate extraction: a bodyless array capture shares its residual receiver', assert => {
  const events = [];
  const values = [4, 5];
  function source() {
    events.push('source');
    return values;
  }
  // eslint-disable-next-line no-var -- an unbraced var declaration is the host under test
  if (values) var [{ at: method, length: size }] = [source()];
  assert.deepEqual([method.call(values, -1), size], [5, 2]);
  assert.deepEqual(events, ['source']);
});
