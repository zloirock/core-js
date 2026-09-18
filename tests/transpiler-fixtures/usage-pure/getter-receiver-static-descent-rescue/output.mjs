import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// A static descent may name a value only an object-literal GETTER could produce: the receiver read is
// text the render DISCARDS, so it owes that read back exactly once, where the source wrote it. The
// ASSIGNMENT host replays it too, out of its emptied pattern, which is the one slot it has; the
// DECLARATION legs place theirs differently - babel inside the initializer, the sidecar as its own
// statement ahead of it - which is what the sidecar records. An inert getter and a plain realm
// receiver are the controls: neither owes a replay.
let reads = 0;
const holder = {
  get g() {
    reads++;
    return _globalThis;
  }
};
const {
  bind
} = (holder.g, _Object$keys);
export const descended = [typeof bind, reads];
const armed = {
  get g() {
    reads++;
    return _globalThis;
  }
};
const from = (armed.g, _Array$from);
export const served = [typeof from, reads];
const inert = {
  get g() {
    return _globalThis;
  }
};
const inertKeys = _Object$keys;
export const withoutEffect = typeof inertKeys;
const {
  bind: realmBind
} = _Object$keys;
export const fromRealm = typeof realmBind;
const assigned = {
  get g() {
    reads++;
    return _globalThis;
  }
};
let assignedBind;
assigned.g;
({
  bind: assignedBind
} = _Object$keys);
export const viaAssignment = [typeof assignedBind, reads];