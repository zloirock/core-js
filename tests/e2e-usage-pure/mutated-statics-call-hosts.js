// The call HOSTS of the mutation pairing get their own module, and two constraints of the pre-pass
// shape every row. It is per-FILE, so a static any sibling test patches is already deopted for every
// read in the file - a row on a shared static passes whether its own host was paired or not. And a
// RESTORE is itself a slot write: restoring through a plain call would deopt the read on its own,
// so each row puts the original back through the same host it is testing, leaving that host as the
// only thing that can name the write. No `had` / `delete` guard either, for the same reason and
// because none is needed - in this flavor the receivers below resolve to the ponyfill constructors,
// which carry the statics on every engine, and no realm global is touched - which is also why the
// descriptor-based save the sibling modules use is not needed here. Receivers with no constructor
// entry are unusable twice over: handing `Object` to a call sends every read of it back to the
// global, patched or not, so such a row is green in both directions, and a row on `Array` would be
// writing the realm's own static. Each row reads BEFORE restoring and asserts afterwards
const src = [1, 2, 3];

// the hosts that spell no plain callee name: `new` names the CLASS while the method it runs is
// keyed `constructor`, an immediately-invoked literal names nothing at all, and a tag hands its
// strings array the first slot. `super` belongs to the same family and is locked by the fixtures
// instead: the post-bundle phase transforms code whose classes are already lowered, so no `super`
// reaches it and a runtime row on that shape would say nothing about the pairing
QUnit.test('mutated-statics: a patch installed through every call host wins', assert => {
  class Setter {
    constructor(target, value) {
      target.groupBy = value;
    }
  }
  const originalGroupBy = Map.groupBy;
  new Setter(Map, () => 'NEW-HOST');
  const fromNew = Map.groupBy(src, it => it);
  new Setter(Map, originalGroupBy);

  const originalAllSettled = Promise.allSettled;
  (function (target, value) {
    target.allSettled = value;
  })(Promise, () => 'IIFE-HOST');
  const fromIife = Promise.allSettled([]);
  (function (target, value) {
    target.allSettled = value;
  })(Promise, originalAllSettled);

  function tag(strings, target, value) {
    target.from = value;
  }
  const originalIteratorFrom = Iterator.from;
  tag`${ Iterator }${ () => 'TAG-HOST' }`;
  const fromTag = Iterator.from(src);
  tag`${ Iterator }${ originalIteratorFrom }`;

  assert.same(fromNew, 'NEW-HOST');
  assert.same(fromIife, 'IIFE-HOST');
  assert.same(fromTag, 'TAG-HOST');
});

// `f.call(t, x)` and `f.apply(t, [x])` invoke F, not a method named `call` - naming the pairing by
// the member key patches nothing this file can reach. `Reflect.apply` spells the same call with the
// function in the first slot, and a `bind` invoked on the spot carries what it captured ahead of
// the call's own arguments. the receiver slot is not one of the paired ones
QUnit.test('mutated-statics: a patch installed through every receiver invoker wins', assert => {
  function setAny(target, value) {
    target.any = value;
  }
  const originalAny = Promise.any;
  setAny.call(null, Promise, () => 'CALL-HOST');
  const fromCall = Promise.any([]);
  setAny.call(null, Promise, originalAny);

  function setConcat(target, value) {
    target.concat = value;
  }
  const originalConcat = Iterator.concat;
  setConcat.apply(null, [Iterator, () => 'APPLY-HOST']);
  const fromApply = Iterator.concat(src);
  setConcat.apply(null, [Iterator, originalConcat]);

  function setZip(target, value) {
    target.zip = value;
  }
  const originalZip = Iterator.zip;
  Reflect.apply(setZip, null, [Iterator, () => 'REFLECT-HOST']);
  const fromReflect = Iterator.zip(src);
  Reflect.apply(setZip, null, [Iterator, originalZip]);

  function setTry(target, value) {
    target.try = value;
  }
  const originalTry = Promise.try;
  setTry.bind(null, Promise)(() => 'BIND-HOST');
  const fromBind = Promise.try(() => 1);
  setTry.bind(null, Promise)(originalTry);

  assert.same(fromCall, 'CALL-HOST');
  assert.same(fromApply, 'APPLY-HOST');
  assert.same(fromReflect, 'REFLECT-HOST');
  assert.same(fromBind, 'BIND-HOST');
});
