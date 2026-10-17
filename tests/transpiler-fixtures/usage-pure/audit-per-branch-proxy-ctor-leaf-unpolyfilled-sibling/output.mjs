import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise from "@core-js/pure/actual/promise/constructor";
// A per-branch (conditional / logical) destructure receiver whose branch is a proxy-global member with a
// pure-CONSTRUCTOR leaf whole-swaps to that pure ctor, so an unpolyfilled sibling key reads off it
// (`_Map.foo`) - the same collapse-target as the nested partial-mirror, and the same in both emitters.
// every proxy navigation shape resolves to the same pure ctor: a direct member (`globalThis.Map`), a
// deeper proxy hop (`globalThis.self.Promise`), and a call-rooted IIFE (`(() => globalThis)().Promise`).
const cond = true;
const groupBy = _Map$groupBy;
const {
  foo
} = cond ? _Map : Object;
const allSettled = _Promise$allSettled;
const {
  bar
} = cond ? _Promise : Object;
const any = _Promise$any;
const {
  baz
} = cond ? _Promise : Object;
export { groupBy, foo, allSettled, bar, any, baz };