{module, test} = QUnit
module \ES7

test 'Object.entries' (assert)->
  {entries, create, assign} = core.Object
  assert.ok typeof! entries is \Function, 'is function'
  assert.strictEqual entries.length, 1, 'arity is 1'
  if \name of entries => assert.strictEqual entries.name, \entries, 'name is "entries"'
  assert.deepEqual entries({q:1, w:2, e:3}), [[\q 1] [\w 2] [\e 3]]
  assert.deepEqual entries(new String \qwe), [[\0 \q] [\1 \w] [\2 \e]]
  assert.deepEqual entries(assign create({q:1, w:2, e:3}), {a:4, s:5, d:6}), [[\a 4] [\s 5] [\d 6]]
  try assert.deepEqual Function('return core.Object.entries({a: 1, get b(){delete this.c;return 2},c: 3})')!, [[\a 1], [\b 2]]