QUnit.test('destructuring assignment: a sole nested instance claim reads its constructor getter once', assert => {
  let reads = 0;
  // eslint-disable-next-line unicorn/no-static-only-class -- the class getter is the source receiver
  class Source {
    static get A() {
      reads++;
      return Array;
    }
  }
  let method;
  // eslint-disable-next-line prefer-const -- assignment is the host under test
  ({ prototype: { at: method } } = Source.A);
  assert.same(reads, 1, 'the dispatch performs the sole source read');
  assert.same(method.call([1, 2], -1), 2, 'the nested instance method works without its native');

  const quiet = { A: Array };
  let quietMethod;
  // eslint-disable-next-line prefer-const -- the quiet assignment is the control
  ({ prototype: { at: quietMethod } } = quiet.A);
  assert.same(quietMethod.call([3, 4], -1), 4, 'the quiet receiver keeps the same dispatch');
});

QUnit.test('destructuring assignment: getter reads stay inside bodyless and discarded sequence hosts', assert => {
  const events = [];
  // eslint-disable-next-line unicorn/no-static-only-class -- the class getter is the source receiver
  class Source {
    static get A() {
      events.push('read');
      return Array;
    }
  }
  let method;
  if (events.length) ({ prototype: { at: method } } = Source.A);
  assert.same(events.length, 0, 'a skipped bodyless assignment performs no read');
  if (!events.length) ({ prototype: { at: method } } = Source.A);
  assert.deepEqual(events, ['read'], 'the taken bodyless assignment reads once');
  assert.same(method.call([1, 2], -1), 2);
  // eslint-disable-next-line @stylistic/no-extra-parens -- the discarded sequence host is the syntax under test
  (events.push('before'), ({ prototype: { at: method } } = Source.A), events.push('after'));
  assert.deepEqual(events, ['read', 'before', 'read', 'after'], 'the sequence keeps the source slot');
  assert.same(method.call([3, 4], -1), 4);
});

QUnit.test('destructuring declaration: the sole getter receiver is the assignment control', assert => {
  let reads = 0;
  const source = {
    get A() {
      reads++;
      return Array;
    },
  };
  const { prototype: { at: method } } = source.A;
  assert.same(reads, 1, 'the declaration also performs one getter read');
  assert.same(method.call([5, 6], -1), 6);
});

QUnit.test('destructuring assignment: a receiver capture keeps every sibling instance claim', assert => {
  const events = [];
  function selected() { return 'selected'; }
  const later = { flat() { return 'later'; } };
  let receiver = {
    get flat() {
      events.push('method');
      receiver = later;
      return selected;
    },
  };
  const known = [1, [2]];
  let method, flat;
  // eslint-disable-next-line prefer-const -- both assignment targets are the host under test
  ({ y: { flat: method }, z: { flat } } = { y: receiver, z: known });
  assert.same(method, selected, 'the getter selects the original method');
  assert.deepEqual(flat.call(known), [1, 2], 'the later sibling also receives its polyfill');
  assert.deepEqual(events, ['method'], 'the source method getter runs once');
});
