// a captured branching alias anchors each hop's reassignment check at ITS read site: the
// source write AFTER `const captured = src` cannot change the captured branching value,
// so both branch statics inject
let src = globalThis.cond ? Array : Iterator;
const captured = src;
src = {};
export const use = captured.from;

// negative: the write lands BEFORE the capture hop reads the source - the captured value
// is the plain object, no `es.map.group-by`
let s2 = globalThis.cond ? Map : Set;
s2 = {};
const cap2 = s2;
export const u2 = cap2.groupBy;

// a MIDDLE hop between the branching source and the captured binding keeps per-hop
// anchoring: the post-capture source write still cannot block the union
let src3 = globalThis.cond ? Array : Iterator;
let mid3 = src3;
src3 = {};
const cap3 = mid3;
export const u3 = cap3.fromAsync;
