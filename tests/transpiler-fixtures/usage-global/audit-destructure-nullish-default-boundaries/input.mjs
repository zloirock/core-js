// a slot DEFAULT that is nullish tells nothing about the runtime value: the member the pattern reads
// may be present (then the default is dead) or absent (then the binding IS the nullish default and
// the member access throws) - neither narrows the receiver, so the typeless row rides. the shadowed
// spelling is the one that must NOT be read as nullish: a local `undefined` is an ordinary value.
// the last row is the instance-free boundary, where every reachable value is a constructor and the
// static axis dispatches alone. distinct method per line so each row is attributable
const { fromUndefined = undefined } = source;
export const a = fromUndefined.at(0);
const { fromVoid = void 0 } = source;
export const b = fromVoid.includes(1);
const { fromNull = null } = source;
export const c = fromNull.flatMap(f);
const [fromSlot = undefined] = source;
export const d = fromSlot.entries();
let instanceFree = null;
instanceFree ||= Object;
export const e = "keys" in instanceFree;
