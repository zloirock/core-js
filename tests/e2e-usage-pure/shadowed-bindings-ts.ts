// Bindings the scope trackers do not register or mis-register, and the type-space names that are
// no binding at all: a parameter property, a write target spelled through a TS wrapper, a class
// expression behind a cast, a type parameter named after a global. The observable is the runtime
// answer in the stripped realms, where only an injected ponyfill can serve the call.

// a constructor parameter PROPERTY binds its name in the constructor's scope: the read dispatches
// the array helper on the array the annotation promises, defaulted or not
QUnit.test('shadowed-bindings-ts: parameter property reads dispatch on the annotated type', assert => {
  class Defaulted {
    r: number | undefined;
    constructor(public a: number[] = [1]) {
      this.r = a.at(0);
    }
  }
  class Bare {
    r: boolean;
    constructor(public b: number[]) {
      this.r = b.includes(2);
    }
  }
  assert.same(new Defaulted().r, 1);
  assert.true(new Bare([2]).r);
});

// a write spelled through a TS wrapper (`a! = v`) is a write: the read after it dispatches
// generically on the string the write installed, never the array helper of the declaration
QUnit.test('shadowed-bindings-ts: write through a non-null target reaches the read', assert => {
  let a: any = [];
  a! = 'xy';
  assert.same(a.at(1), 'y');
  let b: any = [];
  (b as any) = 'pq';
  assert.true(b.includes('q'));
});

// a class expression behind a cast still resolves its own static field
QUnit.test('shadowed-bindings-ts: static field read through a cast class expression', assert => {
  const cast = class Z { static list = [3]; } as never;
  assert.same((cast as { list: number[] }).list.at(0), 3);
});

// a type parameter named after a global is a name, not a reference: it pulls nothing, and the real
// constructor call in the same file is still served by the ponyfill
QUnit.test('shadowed-bindings-ts: type-space names beside a real constructor call', assert => {
  interface Box<Set> { v: Set }
  type Fn = (WeakSet: number) => void;
  const box: Box<number> = { v: 1 };
  const fn: Fn = () => {};
  fn(box.v);
  const s = new Set([1]);
  assert.true(s.has(1));
});
