// defined foreign pair: the default is dead, the pair is unresolvable - no substitution; the static
// read is guarded against the default's candidate and reads the runtime value
let userObj = {};
const [p0, { Map: M } = globalThis] = [{}, userObj];
export const viaForeignPair = M.groupBy([1, 2], v => v);
