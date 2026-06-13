// the dead-tail drop applies to fully-static full-consume patterns; each line below
// probes one boundary:
// a bodyless host block-wraps and trims like any other lift
if (cond) var { from } = (effB(), Array);
// a for-init head can't host a statement-level SE
for (var { of } = (effF(), Array); ; ) break;
// an instance entry needs the receiver at runtime
const { at } = (effI(), [1, 2]);
// a rest element consumes the whole object
const { keys, ...rest } = (effR(), globalThis.Object);
export const r = [from, of, at, keys, rest];
