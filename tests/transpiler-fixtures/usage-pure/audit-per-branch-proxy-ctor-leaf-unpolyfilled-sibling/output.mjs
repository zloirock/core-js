import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise from "@core-js/pure/actual/promise/constructor";
// A per-branch (conditional / logical) destructure receiver whose branch is a proxy-global member with a
// pure-CONSTRUCTOR leaf whole-swaps to that pure ctor, so an unpolyfilled sibling key reads off it
// (`_Map.foo`) - the same collapse-target as the nested partial-mirror, and the same in both emitters.
// every proxy navigation shape resolves to the same pure ctor: a direct member (`globalThis.Map`), a
// deeper proxy hop (`globalThis.self.Promise`), and a call-rooted IIFE (`(() => globalThis)().Promise`).
const cond = true;
const {
  groupBy,
  foo
} = cond ? {
  groupBy: _Map$groupBy,
  foo: _Map.foo
} : {
  groupBy: _Object$groupBy,
  foo: Object.foo
};
const {
  allSettled,
  bar
} = cond ? {
  allSettled: _Promise$allSettled,
  bar: _Promise.bar
} : Object;
const {
  any,
  baz
} = cond ? {
  any: _Promise$any,
  baz: _Promise.baz
} : Object;
export { groupBy, foo, allSettled, bar, any, baz };