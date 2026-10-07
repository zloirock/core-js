import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// The realm itself on the left of `||` / `??` - a global this build serves - decides the selection: a
// static only the right's constructor owns stays a read off the realm, in a declaration and in an
// assignment alike, and the right never runs, so it mirrors nothing (`Array.from`, `Object.fromEntries`).
const {
  from
} = _globalThis;
const {
  fromEntries
} = _self;
let of;
({
  of
} = _globalThis);
export { from, fromEntries, of };