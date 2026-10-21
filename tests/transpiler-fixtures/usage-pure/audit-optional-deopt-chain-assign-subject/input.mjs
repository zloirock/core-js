// Quiet realm subjects retain their optional fold through stores, aliases and prefixes.
// Effectful realm keys keep native navigation; non-realm subjects retain their guards.
let q1, q2, q3, q4, q5, q6;
let c = 0;
let other;
export const parenSubject = ((q1 = globalThis).self)?.Array.prototype.findLast;
export const bareHopSubject = (q2 = globalThis).self?.Array.prototype.flat;
export const seqPrefixSubject = ((c++, (q3 = globalThis).self))?.Array.prototype.at;
export const bareAssignSubject = (q4 = globalThis)?.self.Array.prototype.includes;
const g = globalThis;
export const aliasSubject = g?.self.Array.prototype.findLastIndex;
export const nonProxyLeaf = (q5 = globalThis).foo?.bar.at(1);
export const nonGlobalAssign = (q6 = other).self?.Array.prototype.at.call([1], 0);
let q7, q8;
export const seKeyHopSubject = (q7 = globalThis)?.[(c++, 'self')].Array.prototype.findLast;
export const logicalSubject = ((q8 = globalThis).self || other)?.Array.prototype.flat;
