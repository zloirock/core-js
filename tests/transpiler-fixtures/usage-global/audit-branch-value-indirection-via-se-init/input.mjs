// an SE-prefixed branching init follows through its tail - usage-global never rewrites,
// so the effect stays in source and only the branch statics are added
function tick() { return null; }
const seInit = (tick(), globalThis.cond ? Map : Object);
export const viaSeInit = seInit.groupBy;
