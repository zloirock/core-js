// A `?.` whose subject is ENTIRELY proxy navigation - a chain-assign root with proxy hops
// (`(q = globalThis).self`), paren-wrapped, or SE-prefixed - is dead: the subject collapses to
// the always-defined pure root, the guard deopts, and the collapse owns the emit, preserving the
// assignment and prefix effects as a sequence. a kept guard would memoize the raw `.self` hop
// (undefined off-engine) and silently swallow the polyfill. an alias subject deopts the same way,
// keeping its identifier. a BARE chain-assign subject (hops only AFTER the `?.`) collapses too:
// the AST emitter deopts the guard outright; the text emitter keeps a dead, always-passing guard
// over the memoized assign while still dropping the tail's redundant hop off the memo -
// runtime-equal. a non-proxy leaf and a non-global assign value keep their guards untouched
// (those subjects may legitimately be undefined).
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
// a SE-bearing computed hop key deopts too, its effect harvested into the collapsed sequence;
// a LOGICAL subject keeps the guard (the right operand may be picked), collapsing per-operand
let q7, q8;
export const seKeyHopSubject = (q7 = globalThis)?.[(c++, 'self')].Array.prototype.findLast;
export const logicalSubject = ((q8 = globalThis).self || other)?.Array.prototype.flat;
