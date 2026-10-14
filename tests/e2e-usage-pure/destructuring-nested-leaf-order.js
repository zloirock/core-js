/* eslint-disable no-var, @stylistic/one-var-declaration-per-line -- an unbraced `var` and a declarator beside the destructure are hosts under test */
// a nested pattern whose leaf level holds a claim beside other bindings reads that level in source order:
// a binding written ahead of the claim runs its getter first, whatever host the pattern stands in, and a
// computed key's effect runs before the claim reads its slot - also where an object literal is the
// container, whose claim reads the value its slot holds. the patterns read a parameter, so the claim
// stays alive over a receiver the transform cannot type
function leafWithGetters(log) {
  return {
    get other() {
      log.push('other');
      return { q: 1 };
    },
    get at() {
      log.push('at');
      return 'own';
    },
  };
}

QUnit.test('destructuring: a nested leaf declaration reads a leading sibling before its claim', assert => {
  function read(box) {
    const { y: { other: { q }, at } } = box;
    const { k, y: { other: { q: split }, at: splitAt } } = box;
    const { y: { other: { q: folded }, at: foldedAt } = {} } = box;
    return [q, at, k, split, splitAt, folded, foldedAt];
  }
  const log = [];
  assert.deepEqual(read({ k: 0, y: leafWithGetters(log) }), [1, 'own', 0, 1, 'own', 1, 'own']);
  assert.deepEqual(log, ['other', 'at', 'other', 'at', 'other', 'at']);
});

QUnit.test('destructuring assignment: a nested leaf reads a leading sibling before its claim', assert => {
  function read(box) {
    let other, at;
    // eslint-disable-next-line prefer-const -- the assignment is the host under test
    ({ y: { other, at } } = box.c);
    return [other.q, at];
  }
  const log = [];
  assert.deepEqual(read({ c: { y: leafWithGetters(log) } }), [1, 'own']);
  assert.deepEqual(log, ['other', 'at']);
});

QUnit.test('destructuring: a nested leaf in a loop head, an unbraced var or a catch clause keeps source order', assert => {
  function read(box) {
    const values = [];
    // eslint-disable-next-line no-unreachable-loop -- the loop head is the host under test
    for (const { y: { other: { q }, at } } = box; ;) {
      values.push(q, at);
      break;
    }
    if (values.length) var { y: { other: { q: unbraced }, at: unbracedAt } = {} } = box;
    try {
      throw box;
    } catch ({ y: { other: { q: caught }, at: caughtAt = 'default' } }) {
      values.push(caught, caughtAt);
    }
    return [...values, unbraced, unbracedAt];
  }
  const log = [];
  assert.deepEqual(read({ y: leafWithGetters(log) }), [1, 'own', 1, 'own', 1, 'own']);
  assert.deepEqual(log, ['other', 'at', 'other', 'at', 'other', 'at']);
});

QUnit.test('destructuring: a computed key effect in a nested leaf runs before the claim reads its slot', assert => {
  function read(source, touch) {
    const { y: { z: { w }, [(touch(), 'at')]: a } } = source;
    return [w, a];
  }
  const source = { y: { z: { w: 1 }, at: 'before' } };
  assert.deepEqual(read(source, () => {
    source.y.at = 'after';
  }), [1, 'after']);
});

QUnit.test('destructuring: a literal container claim beside another declarator reads after its key effect', assert => {
  function read(source, touch) {
    const first = 1, { y: { other: { q }, [(touch(), 'at')]: a } } = { y: source };
    return [first, q, a];
  }
  const source = { other: { q: 2 }, at: 'before' };
  assert.deepEqual(read(source, () => {
    source.at = 'after';
  }), [1, 2, 'after']);
});

QUnit.test('destructuring: an unbraced var reads every literal container claim off the slot', assert => {
  function read(source) {
    if (source) var first = 1, { y: { other: { q }, [(source.seen++, 'at')]: a } } = { y: source };
    if (source) var second = 2, { y: { other: { q: r }, [(source.seen++, 'at')]: b, [(source.seen++, 'includes')]: c } } = { y: source };
    if (source) var third = 3, { y: { other: { q: s }, at: d } } = { y: source };
    return [first, q, a, second, r, b, c, third, s, d, source.seen];
  }
  assert.deepEqual(read({ other: { q: 3 }, at: 'own', includes: 'also', seen: 0 }), [1, 3, 'own', 2, 3, 'own', 'also', 3, 3, 'own', 3]);
});

QUnit.test('destructuring: a claim ahead of a nested level reads its slot before the level', assert => {
  function read(source) {
    const { includes, y: { at, other: { q } } } = source;
    return [includes(), at.call([4, 5], -1), q];
  }
  const log = [];
  const page = Object.assign([1, 2, 3], { other: { q: 7 } });
  const result = read({
    get includes() {
      log.push('includes');
      return () => 'own';
    },
    get y() {
      log.push('y');
      return page;
    },
  });
  assert.deepEqual([...result, log], ['own', 5, 7, ['includes', 'y']]);
});

QUnit.test('destructuring: claims beside a nested pattern bind off a memoized literal slot in an unbraced body', assert => {
  const log = [];
  const page = Object.assign([1, 2, 3], { other: { q: 7 } });
  const source = {
    get y() {
      log.push('y');
      return page;
    },
  };
  function read(flag) {
    if (flag) var { y: { other: { q }, at, includes } } = { y: source.y }, first = 1;
    if (flag) var { y: { other: { q: r }, flat, findLast } } = { y: source.y }, second = 2;
    return [q, at.call([4, 5], -1), includes.call([6], 6), first, r, flat.call([[8]])[0], findLast.call([9, 10], x => x < 10), second, log.length];
  }
  assert.deepEqual(read(true), [7, 5, true, 1, 7, 8, 9, 2, 2]);
});

QUnit.test('destructuring: a claim beside a nested claim reads a member receiver once', assert => {
  const log = [];
  const page = Object.assign([1, 2, 3], { options: [3, 1, 2] });
  const store = {
    get state() {
      log.push('state');
      return page;
    },
    view() {
      const { at, options: { toSorted } } = this.state;
      return [at.call([4, 5], -1), toSorted.call([2, 1])];
    },
  };
  assert.deepEqual(store.view(), [5, [1, 2]]);
  assert.deepEqual(log, ['state']);
});

QUnit.test('destructuring: a host claim ahead of a split nested leaf binds once', assert => {
  function read(box) {
    const { includes, y: { other: { q }, at } } = box;
    return [typeof includes, q, at];
  }
  const log = [];
  assert.deepEqual(read({ includes() { /* empty */ }, y: leafWithGetters(log) }), ['function', 1, 'own']);
  assert.deepEqual(log, ['other', 'at']);
});

QUnit.test('destructuring assignment: parentheses around a nested leaf read its hop once', assert => {
  function read(box) {
    let other, at;
    // eslint-disable-next-line prefer-const, @stylistic/no-extra-parens, sonarjs/no-redundant-parentheses -- the host under test
    (({ y: { other, at } } = box));
    return [other.q, at];
  }
  const log = [];
  const box = {
    get y() {
      log.push('y');
      return leafWithGetters(log);
    },
  };
  assert.deepEqual(read(box), [1, 'own']);
  assert.deepEqual(log, ['y', 'other', 'at']);
});

QUnit.test('destructuring: a computed key effect on a nested hop runs', assert => {
  function read(box, touch) {
    const { [(touch(), 'y')]: { other: { q }, at } } = box;
    return [q, at];
  }
  const log = [];
  assert.deepEqual(read({ y: leafWithGetters(log) }, () => log.push('touch')), [1, 'own']);
  assert.deepEqual(log, ['touch', 'other', 'at']);
});

QUnit.test('destructuring: a static read through a container slot keeps its binding beside a nested claim', assert => {
  const log = [];
  const box = { A: Array };
  const { A: { [(log.push('key'), 'from')]: from, name, other: { q } = { q: 5 } } } = box;
  const { A: { of, name: label, more: { r } = { r: 6 } } } = box;
  assert.deepEqual([from('ab'), name, q, of(1, 2), label, r, log], [['a', 'b'], 'Array', 5, [1, 2], 'Array', 6, ['key']]);
});

QUnit.test('destructuring: claims ahead of a nested level read a computed root once, and so does the level claim', assert => {
  const log = [];
  const page = Object.assign([1, 2, 3], { other: { q: 7 } });
  function make() {
    log.push('make');
    return {
      get includes() {
        log.push('includes');
        return () => 'own';
      },
      get y() {
        log.push('y');
        return page;
      },
    };
  }
  function viaCall(source) {
    const { includes, y: { findLast, other: { q } } } = source();
    return [includes(), findLast.call([4, 5], x => x < 5), q];
  }
  function viaSequence(source) {
    const { includes, y: { at, other: { q } } } = (log.push('prefix'), source());
    return [includes(), at.call([4, 5], -1), q];
  }
  function viaMember(holder) {
    const { includes, y: { toReversed, other: { q } } } = holder.box;
    return [includes(), toReversed.call([4, 5]), q];
  }
  function viaThis() {
    const { includes, y: { flat, other: { q } } } = this;
    return [includes(), flat.call([[4], [5]]), q];
  }
  const holder = {
    get box() {
      log.push('box');
      return make();
    },
  };
  assert.deepEqual(viaCall(make), ['own', 4, 7]);
  assert.deepEqual(viaSequence(make), ['own', 5, 7]);
  assert.deepEqual(viaMember(holder), ['own', [5, 4], 7]);
  assert.deepEqual(viaThis.call(make()), ['own', [4, 5], 7]);
  assert.deepEqual(log, ['make', 'includes', 'y', 'prefix', 'make', 'includes', 'y', 'box', 'make', 'includes', 'y', 'make', 'includes', 'y']);
});
