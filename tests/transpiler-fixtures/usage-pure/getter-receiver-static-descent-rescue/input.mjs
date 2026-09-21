// A discarded accessor receiver read runs once before its pure static is bound.
// An inert getter and a plain realm require no effect replay.
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
