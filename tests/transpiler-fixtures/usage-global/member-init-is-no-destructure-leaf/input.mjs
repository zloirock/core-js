// a MEMBER read in a declarator init is no destructure leaf: the indirection backstop enumerating
// branching receivers answers for a pattern's host slot, and a member handed to it must not resolve
// the whole init as its receiver - `pick(input.from)` names Array nowhere, so es.array.from stays out.
// the destructure form of the same call still enumerates both branches
const cond = 1;
function pick() { return cond ? Array : Object; }
export function viaInit(input) { const out = pick(input.of); return out; }
export function viaAssign(input) { let out; out = pick(input.isArray); return out; }
export function control(input) { pick(input.entries); }
export const { from } = pick();
