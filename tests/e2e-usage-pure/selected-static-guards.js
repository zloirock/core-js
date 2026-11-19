/* eslint-disable no-unsafe-optional-chaining -- The source boundaries are asserted. */
import { withWindowPresence } from './unbacked-window-host.cjs';

QUnit.test('selected statics survive optional calls and receiver captures', assert => {
  for (const choice of [false, true]) {
    const A = choice ? Array : null;
    const O = choice ? Object : null;
    assert.deepEqual(A?.from([3]), choice ? [3] : undefined);
    assert.deepEqual(A?.from?.([3]), choice ? [3] : undefined);
    assert.deepEqual(O?.fromEntries([['x', 3]]), choice ? { x: 3 } : undefined);
    assert.strictEqual((choice ? Array : null)?.of(3).at(0), choice ? 3 : undefined);
    assert.deepEqual((choice ? Object : null)?.entries({ x: 3 }).at(0), choice ? ['x', 3] : undefined);
    if (choice) assert.deepEqual((A?.from)([3]), [3]);
    else assert.throws(() => (A?.from)([3]), TypeError);
    const B = choice ? Array : {};
    assert.strictEqual(B.from?.([3]).length, choice ? 1 : undefined);
    // eslint-disable-next-line @stylistic/no-extra-parens -- Preserve the source chain boundary under test.
    assert.true(delete (A?.from)?.([3]).value);
  }
});

QUnit.test('selected static fallback keeps its getter, arguments and receiver', assert => {
  for (const choice of [false, true]) {
    const effects = [];
    const custom = {
      value: 7,
      get entries() {
        effects.push('get');
        return function () {
          effects.push(this === custom ? 'this' : 'wrong-this');
          return [['x', this.value]];
        };
      },
    };
    const value = (choice ? Object : custom)?.entries((effects.push('arg'), { x: 3 })).at(0);
    assert.deepEqual(value, ['x', choice ? 3 : 7]);
    assert.deepEqual(effects, choice ? ['arg'] : ['get', 'arg', 'this']);
  }
});

QUnit.test('a kept store writes once before the optional static', assert => {
  for (const choice of [false, true]) {
    const A = choice ? Array : null;
    const effects = [];
    let held;
    const box = {
      get value() { throw new Error('getter'); },
      set value(value) { effects.push('write'); held = value; },
    };
    const value = (effects.push('prefix'), box.value = A)?.from((effects.push('arg'), [3]));
    assert.deepEqual(value, choice ? [3] : undefined);
    assert.strictEqual(held, A);
    assert.deepEqual(effects, choice ? ['prefix', 'write', 'arg'] : ['prefix', 'write']);
  }
});

QUnit.test('a selected realm preserves each optional boundary', assert => {
  for (const choice of [false, true]) {
    assert.deepEqual((choice ? globalThis : null)?.Object.fromEntries([['x', 3]]), choice ? { x: 3 } : undefined);
    assert.deepEqual((choice ? globalThis : null)?.Array?.from([3]), choice ? [3] : undefined);
  }
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    // eslint-disable-next-line unicorn/prefer-global-this -- The optional environment probe is under test.
    assert.deepEqual((typeof window !== 'undefined' ? window : undefined)?.Array.from([3]), present ? [3] : undefined);
  });
});

export class SelectedStaticReader {
  static #owner = Map;
  static read() { return SelectedStaticReader.#owner.groupBy([3], String).get('3'); }
}

QUnit.test('private static receivers keep their keys and required namespace', assert => {
  assert.deepEqual(SelectedStaticReader.read(), [3]);
  for (const choice of [false, true]) {
    class Reader {
      static #owner = choice ? Map : Object;
      static read() { return Reader?.#owner.groupBy([3], String); }
    }
    const result = Reader.read();
    assert.deepEqual(choice ? result.get('3') : result['3'], [3]);
  }
});

QUnit.test('a private receiver write invalidates its initial constructor', assert => {
  class Reader {
    static #owner = Map;
    static set(value) { Reader.#owner = value; }
    static read() { return Reader.#owner.groupBy([3], String); }
  }
  assert.deepEqual(Reader.read().get('3'), [3]);
  Reader.set({ groupBy() { return 7; } });
  assert.strictEqual(Reader.read(), 7);
});

QUnit.test('private and public string slots keep separate constructor values', assert => {
  class Reader {
    static #owner = Object;
    // eslint-disable-next-line no-useless-computed-key -- Distinguish the public string from the private field.
    static ['#owner'] = Map;
    static read() { return Reader['#owner'].groupBy([3], String).get('3'); }
    static privateRead() { return Reader.#owner.groupBy([3], String)['3']; }
  }
  assert.deepEqual(Reader.read(), [3]);
  assert.deepEqual(Reader.privateRead(), [3]);
});

QUnit.test('returning a private value exposes the held container to writes', assert => {
  // eslint-disable-next-line unicorn/no-static-only-class -- A class held by a private field is the source shape under test.
  class Inner { static C = Object; }
  class Outer {
    static #value = Inner;
    static take() { return Outer.#value; }
  }
  Function('C', 'C.C = { groupBy: function () { return {3: [7]}; } };')(Outer.take());
  const { C: { groupBy } } = Inner;
  assert.deepEqual(groupBy([3], String)['3'], [7]);
});

QUnit.test('a static private this read exposes the held container to writes', assert => {
  // eslint-disable-next-line unicorn/no-static-only-class -- A class held by a private field is the source shape under test.
  class Inner { static C = Object; }
  class Outer {
    static #value = Inner;
    // eslint-disable-next-line no-unused-vars, no-shadow -- Shadow the class name to check private this ownership.
    static take(Outer) { return this.#value; }
  }
  Function('C', 'C.C = { groupBy: function () { return {3: [11]}; } };')(Outer.take());
  const { C: { groupBy } } = Inner;
  assert.deepEqual(groupBy([3], String)['3'], [11]);
});
