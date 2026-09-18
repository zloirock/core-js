// A static descent may name a value only an object-literal GETTER could produce: the receiver read is
// text the render DISCARDS, so it owes that read back exactly once, where the source wrote it. The
// ASSIGNMENT host replays it too, out of its emptied pattern, which is the one slot it has; the
// DECLARATION legs place theirs differently - babel inside the initializer, the sidecar as its own
// statement ahead of it - which is what the sidecar records. An inert getter and a plain realm
// receiver are the controls: neither owes a replay.
let reads = 0;
const holder = { get g() { reads++; return globalThis; } };
const { Object: { keys: { bind } } } = holder.g;
export const descended = [typeof bind, reads];

const armed = { get g() { reads++; return globalThis; } };
const { Array: { from } } = armed.g;
export const served = [typeof from, reads];

const inert = { get g() { return globalThis; } };
const { Object: { keys: inertKeys } } = inert.g;
export const withoutEffect = typeof inertKeys;

const { Object: { keys: { bind: realmBind } } } = globalThis;
export const fromRealm = typeof realmBind;

const assigned = { get g() { reads++; return globalThis; } };
let assignedBind;
({ Object: { keys: { bind: assignedBind } } } = assigned.g);
export const viaAssignment = [typeof assignedBind, reads];
