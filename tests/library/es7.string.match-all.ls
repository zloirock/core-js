{module, test} = QUnit
module 'ESNext'

test 'String#matchAll' (assert)!->
  {matchAll} = core.String
  {assign} = core.Object
  assert.isFunction matchAll
  for [\aabc {toString: -> \aabc}]
    iter = matchAll .., /[ac]/
    assert.isIterator iter
    assert.isIterable iter
    assert.deepEqual iter.next!, {value: assign(<[a]> {input: \aabc, index: 0}), done: no}
    assert.deepEqual iter.next!, {value: assign(<[a]> {input: \aabc, index: 1}), done: no}
    assert.deepEqual iter.next!, {value: assign(<[c]> {input: \aabc, index: 3}), done: no}
    assert.deepEqual iter.next!, {value: null, done: on}
  iter = matchAll \1111a2b3cccc /(\d)(\D)/
  assert.isIterator iter
  assert.isIterable iter
  assert.deepEqual iter.next!, {value: assign(<[1a 1 a]> {input: \1111a2b3cccc, index: 3}), done: no}
  assert.deepEqual iter.next!, {value: assign(<[2b 2 b]> {input: \1111a2b3cccc, index: 5}), done: no}
  assert.deepEqual iter.next!, {value: assign(<[3c 3 c]> {input: \1111a2b3cccc, index: 7}), done: no}
  assert.deepEqual iter.next!, {value: null, done: on}
  for [null void \qwe NaN, 42 new Date!, {} []]
    assert.throws (!-> matchAll '' ..), TypeError, "Throws on #{..} as first arguments"
  if STRICT => for [null void]
    assert.throws (!-> matchAll .., /./), TypeError, "Throws on #{..} as `this`"