import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// a binding names the realm by the VALUE it holds, and that value is the resolution canon's question
// - the proxy narrow only keeps the realm names off its answer. a copy that walked the init itself
// bottomed out on two terminals, so a call-captured root read as "no proxy" HERE while the global-read
// channel called it the realm: the static below it then rode a `*/constructor` binding that carries no
// statics at all. one spelling per line - a shared method would mask the neighbours' regression
function makeRealm() {
  return _globalThis;
}
const viaCall = makeRealm();
export const fromCall = _Map$groupBy([1], x => x);
function identity(value) {
  return value;
}
const viaIdentity = identity(_globalThis);
export const fromIdentity = _Object$hasOwn({}, 'k');
let held;
const viaChainAssign = held = _globalThis;
export const fromChainAssign = _Array$from('ab');
const [viaSlot] = [_globalThis];
export const fromSlot = _Promise$resolve(1);