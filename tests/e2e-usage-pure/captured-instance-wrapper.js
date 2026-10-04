import { withTemporaryProperty } from '../helpers/restore-property.cjs';

QUnit.test('a captured instance leaf selects the first method value after its wrapper', assert => {
  const prototype = Object.getPrototypeOf([]);
  function selected() { return 'first'; }
  function later() { return 'later'; }
  for (const name of ['at', 'toSpliced']) {
    let reads = 0;
    const events = [];
    withTemporaryProperty(prototype, name, undefined, () => {
      Object.defineProperty(prototype, name, {
        configurable: true,
        get() {
          events.push('lookup');
          return ++reads === 1 ? selected : later;
        },
      });
      if (name === 'at') {
        const spread = {
          get own() {
            events.push('spread');
            return 1;
          },
        };
        const { [(events.push('key'), 'w')]: { at: method } } = { ...spread, w: [1, 2] };
        assert.same(method, selected);
        assert.arrayEqual(events.slice(0, 3), ['spread', 'key', 'lookup']);
        reads = 0;
        events.length = 0;
        // eslint-disable-next-line no-var -- the bodyless declaration is the tested host
        if (selected) var { w: { at: bodyless } } = { ...spread, w: [1, 2] };
        assert.same(bodyless, selected);
        assert.arrayEqual(events.slice(0, 2), ['spread', 'lookup']);
      } else {
        // eslint-disable-next-line unicorn/no-useless-spread -- the positional spread is the tested wrapper
        const { 0: { toSpliced: method } } = [...[[1]]];
        assert.same(method, selected);
        assert.same(events[0], 'lookup');
      }
    });
  }
});

QUnit.test('a later sibling throw keeps the earlier native method read', assert => {
  const prototype = Object.getPrototypeOf([]);
  const events = [];
  const marker = new RangeError('later sibling');
  let reads = 0;
  let thrown;
  withTemporaryProperty(prototype, 'at', undefined, () => {
    Object.defineProperty(prototype, 'at', {
      configurable: true,
      get() {
        reads++;
        events.push('lookup');
        return function () { return 1; };
      },
    });
    const spread = {
      get own() {
        events.push('spread');
        return 1;
      },
    };
    try {
      // eslint-disable-next-line no-empty-pattern -- the later empty sibling tests native coercion ordering
      const { w: { at }, z: {} } = {
        ...spread,
        w: [1],
        get z() {
          events.push('sibling');
          throw marker;
        },
      };
      thrown = at;
    } catch (error) {
      thrown = error;
    }
    assert.same(thrown, marker);
    assert.same(reads, 1);
    assert.arrayEqual(events, ['spread', 'lookup', 'sibling']);
  });
});

QUnit.test('a captured array wrapper preserves native sibling order', assert => {
  const events = [];
  const marker = new RangeError('length');
  function selected() { return 1; }
  function mark() { events.push('key'); }
  function methodFirst(unknown) {
    let result;
    for (const e of [Array]) {
      const [{ [(mark(), 'of')]: of, from }, { at, length }] = [e, unknown];
      result = [typeof of, typeof from, at, length];
    }
    return result;
  }
  function nativeFirst(unknown) {
    let result;
    for (const e of [Array]) {
      const [{ [(mark(), 'of')]: of, from }, { length, at }] = [e, unknown];
      result = [typeof of, typeof from, at, length];
    }
    return result;
  }
  for (const [read, order] of [[methodFirst, ['at', 'length']], [nativeFirst, ['length', 'at']]]) {
    for (const throws of [false, true]) {
      events.length = 0;
      const receiver = {
        get at() {
          events.push('at');
          return selected;
        },
        get length() {
          events.push('length');
          if (throws) throw marker;
          return 2;
        },
      };
      if (throws) assert.throws(() => read(receiver), error => error === marker);
      else assert.arrayEqual(read(receiver), ['function', 'function', selected, 2]);
      assert.arrayEqual(events, ['key', ...throws && read === nativeFirst ? ['length'] : order]);
    }
  }
});
