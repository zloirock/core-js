// the dead-tail drop applies only to statement-liftable hosts with fully-static patterns;
// each line below violates one precondition and must keep the tail read alive:
// a bodyless host can't lift the SE statement
if (cond) var { from } = (effB(), Array);
// a for-init head can't host a statement-level SE
for (var { of } = (effF(), Array); ; ) break;
// an instance entry needs the receiver at runtime
const { at } = (effI(), [1, 2]);
// a rest element consumes the whole object
const { keys, ...rest } = (effR(), globalThis.Object);
export const r = [from, of, at, keys, rest];
