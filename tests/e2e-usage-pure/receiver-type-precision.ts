// Closed receivers keep their family without changing keys, getters or exception flow.
QUnit.test('receiver precision: enum own values and computed keys', assert => {
  enum E { at = 'at' }
  let calls = 0;
  const box = { [(calls++, E.at)]: 7 };
  assert.same(E.at, 'at');
  assert.same(box.at, 7);
  assert.same(calls, 1);
  E.at = (() => 9) as any;
  assert.same((E.at as any)(), 9, 'a written own enum method stays native');
  enum F { at = 'at' }
  F = 'ab' as any;
  assert.same((F as any).at(-1), 'b', 'replacing the enum receiver retains instance dispatch');
});

QUnit.test('receiver precision: inherited function makes the nested default dead', assert => {
  let defaults = 0;
  const { toString: { at } = (defaults++, [1, 2]) } = {};
  assert.same(at, undefined);
  assert.same(defaults, 0);
  const { toString: { includes } } = { toString: 'ab' };
  assert.true(includes.call('ab', 'ab'), 'an own string override retains its family');
});

QUnit.test('receiver precision: inherited function read before call', assert => {
  const box = {
    run() {
      void (this.toString as any).at;
      return this.toString().at(-1);
    },
  };
  assert.same(box.run(), ']', 'the function value does not describe its call result');
});

QUnit.test('receiver precision: class constructor prototype and getter effects', assert => {
  let reads = 0;
  class Box {
    static get C() { reads++; return Array; }
    static S = String;
  }
  assert.same(Box.C.prototype.at.call([10, 20], -1), 20);
  const { C: { prototype: { includes } } } = Box;
  assert.true(includes.call([10, 20], 20));
  assert.same(reads, 2, 'one evaluation per source receiver');
  assert.same(Box.S.prototype.at.call('ab', -1), 'b');
  Box.S = Array;
  assert.same(Box.S.prototype.at.call([1, 2], -1), 2, 'a written field stays conservative');
});

QUnit.test('receiver precision: closed defaults and caller-supplied values', assert => {
  function closed({ at } = [[1, 2]][0]) { return at.call([3, 4], -1); }
  assert.same(closed(), 4);
  assert.same(closed(void 0), 4);
  function supplied({ at } = [1, 2]) { return at; }
  const own = () => 9;
  assert.same(supplied({ at: own }), own);
  assert.same(supplied({ at: undefined }), undefined);
});

QUnit.test('receiver precision: local catch retains reads and tracks writes', assert => {
  const rows = [[1, 2]];
  try { throw rows; } catch (e) { assert.same(e.length, 1); }
  const [{ at }] = rows;
  assert.same(at.call([3, 4], -1), 4);
  const box = { data: [1, 2] };
  try { throw box; } catch (e) { e.data = 'ab'; }
  assert.same(box.data.at(-1), 'b', 'the catch alias can replace the receiver family');
  let key;
  assert.same(Array[key], undefined, 'an unwritten local key holds undefined');
});

QUnit.test('receiver precision: deleted field direct', assert => {
  const box = { __proto__: { data: 'pq' }, data: [8, 9] };
  delete box.data;
  const r = box.data.at(-1);
  assert.same(r, 'q', 'the inherited string replaces the removed array');
});

QUnit.test('receiver precision: deleted field alias', assert => {
  const box = { __proto__: { data: 'pq' }, data: [8, 9] };
  const alias = box;
  delete alias.data;
  const r = box.data.at(-1);
  assert.same(r, 'q', 'the inherited string replaces the removed array');
});

QUnit.test('receiver precision: deleted field caught', assert => {
  const box = { __proto__: { data: 'pq' }, data: [8, 9] };
  try { throw box; } catch (e) { delete e.data; }
  const r = box.data.at(-1);
  assert.same(r, 'q', 'the inherited string replaces the removed array');
});

QUnit.test('receiver precision: deleted field caught-destructure', assert => {
  const box = { __proto__: { data: 'pq' }, data: [8, 9] };
  try { throw { box }; } catch ({ box: e }) { delete e.data; }
  const r = box.data.at(-1);
  assert.same(r, 'q', 'the inherited string replaces the removed array');
});

QUnit.test('receiver precision: deleted field object-method', assert => {
  const box = {
    __proto__: { data: 'pq' },
    data: [8, 9],
    remove() { delete this.data; },
  };
  box.remove();
  const r = box.data.at(-1);
  assert.same(r, 'q', 'the inherited string replaces the removed array');
});

QUnit.test('receiver precision: deleted field class-instance', assert => {
  // A writable prototype slot also survives the suite's loose class-field lowering.
  class Base { declare data: any; }
  Base.prototype.data = 'pq';
  class Box extends Base {
    data = [8, 9];
    remove() { delete this.data; }
  }
  const box = new Box();
  box.remove();
  const r = box.data.at(-1);
  assert.same(r, 'q', 'the inherited string replaces the removed array');
});

QUnit.test('receiver precision: deleted field class-static', assert => {
  // Runtime JS permits an own field to override a differently typed inherited slot.
  class Base { static data = 'pq'; }
  class Box extends Base {
    static data = [8, 9];
    static remove() { delete this.data; }
  }
  Box.remove();
  const r = Box.data.at(-1);
  assert.same(r, 'q', 'the inherited string replaces the removed array');
});

QUnit.test('receiver precision: deleted field static-block', assert => {
  class Base { static data = 'pq'; }
  class Box extends Base {
    static data = [8, 9];
    static { delete this.data; }
  }
  const r = Box.data.at(-1);
  assert.same(r, 'q', 'the inherited string replaces the removed array');
});

QUnit.test('receiver precision: deleted field arrow-root', assert => {
  class Base { static data = 'pq'; }
  class Box extends Base {
    static data = [8, 9];
    static remove = () => delete this.data;
  }
  Box.remove();
  const r = Box.data.at(-1);
  assert.same(r, 'q', 'the inherited string replaces the removed array');
});

QUnit.test('receiver precision: deleted field computed-key', assert => {
  const effects = [];
  const box = { __proto__: { data: 'pq' }, data: [8, 9] };
  const key = 'data';
  delete box[(effects.push('delete'), key)];
  const r = box.data.at(-1);
  assert.same(r, 'q', 'the inherited string replaces the removed array');
  assert.same(effects[0], 'delete');
  assert.same(effects.length, 1, 'the delete key runs once');
});

QUnit.test('receiver precision: deleted field opaque-key', assert => {
  const effects = [];
  const box = { __proto__: { data: 'pq' }, data: [8, 9] };
  function key() { effects.push('delete'); return 'data'; }
  delete box[key()];
  const r = box.data.at(-1);
  assert.same(r, 'q', 'the inherited string replaces the removed array');
  assert.same(effects[0], 'delete');
  assert.same(effects.length, 1, 'the delete key runs once');
});

QUnit.test('receiver precision: deleted getter exposes a string', assert => {
  let reads = 0;
  const box = { __proto__: { data: 'pq' }, get data() { reads++; return [8, 9]; } };
  delete (box as any).data;
  assert.true(box.data.includes('pq' as any));
  assert.same(reads, 0, 'the removed getter never runs');
});

QUnit.test('receiver precision: receiver method deletes its getter', assert => {
  const box = {
    __proto__: { data: 'pq' },
    get data() { return [8, 9]; },
    remove() { delete this.data; },
  };
  box.remove();
  assert.true(box.data.includes('pq' as any));
});

QUnit.test('receiver precision: replaced getter descriptor', assert => {
  const box = { get data() { return [8, 9]; } };
  Object.defineProperty(box, 'data', { value: 'pq' });
  assert.true(box.data.includes('pq' as any));
  const other = { get data() { return [8, 9]; } };
  Reflect.defineProperty(other, 'data', { value: 'pq' });
  assert.true(other.data.includes('pq' as any));
});

QUnit.test('receiver precision: setter-only slot enables a nested default', assert => {
  let defaults = 0;
  const box = { set toString(value: any) {} };
  const { toString: { includes } = (defaults++, [8, 9]) } = box;
  assert.true(includes.call([8, 9], 9));
  assert.same(defaults, 1);
  const key = 'toString';
  const other = { set [key](value: any) {} };
  const { toString: { at } = (defaults++, [8, 9]) } = other;
  assert.same(at.call([8, 9], -1), 9);
  assert.same(defaults, 2);
});

QUnit.test('receiver precision: paired getter setter skips the default', assert => {
  let reads = 0;
  let defaults = 0;
  const box = {
    get toString() { reads++; return [8, 9]; },
    set toString(value: number[]) {},
  };
  const { toString: { includes } = (defaults++, [1]) } = box;
  assert.true(includes.call([8, 9], 9));
  assert.same(reads, 1);
  assert.same(defaults, 0);
});

QUnit.test('receiver precision: data resets an accessor before a setter', assert => {
  let reads = 0;
  let defaults = 0;
  // Runtime JS allows duplicate members that TypeScript rejects; the data definition
  // removes the getter, so the final setter-only slot cannot invoke it.
  const box = {
    get toString() { reads++; return 'ab'; },
    toString: [1],
    set toString(value: any) {},
  };
  const { toString: { includes } = (defaults++, [8, 9]) } = box;
  assert.true(includes.call([8, 9], 9));
  assert.same(defaults, 1);
  assert.same(reads, 0);
  const paired = {
    get data() { reads++; return 'ab'; },
    set data(value: string) {},
    set data(value: string) {},
  };
  const { data: { at } = (defaults++, [1]) } = paired;
  assert.same(at.call('ab', -1), 'b', 'repeated setters keep the installed getter');
  assert.same(defaults, 1);
  assert.same(reads, 1);
});

QUnit.test('receiver precision: an unknown method key can replace a data slot', assert => {
  const effects = [];
  function key(value) { effects.push(value); return 'rows'; }
  const box = {
    rows: [1, 2],
    [key(this)]() {},
    read() { return this.rows.at(0); },
  };
  assert.throws(() => box.read(), TypeError, 'the receiver is a function, whose at is absent');
  assert.same(effects.length, 1, 'the computed key runs once before the receiver exists');
});

QUnit.test('receiver precision: an unknown data key can replace the receiver family', assert => {
  const effects = [];
  function key(value) { effects.push(value); return 'rows'; }
  const box = {
    rows: [1, 2],
    [key(this)]: 'ab',
    read() { return this.rows.at(-1); },
  };
  assert.same(box.read(), 'b', 'the written string needs its own at polyfill in a stripped realm');
  assert.same(effects.length, 1);
});
