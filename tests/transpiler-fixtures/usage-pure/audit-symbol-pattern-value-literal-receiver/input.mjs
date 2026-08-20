// a pattern-VALUED Symbol.iterator prop (`[Symbol.iterator]: { ... }`) composes its extraction
// text from the pattern subtree, so it must drain at FLUSH, after the natural visitor rewrote
// the inner nodes - an eager visit-time compose on the constant-literal-receiver path lost the
// inner polyfill and its sentinel overwrite collided with the later inner transform, hard-
// aborting the whole file transform (the deferred member-memo path already drained correctly)

// the aborting seed: constant-literal receiver + inner polyfillable default + a sibling prop
const { [Symbol.iterator]: { next = [1].flat() }, other } = [1, 2, 3];
export const viaLiteralDefault = [next, other];

// no inner default - same routing, nothing to lose but the timing
const { [Symbol.iterator]: { name: iterName }, second } = [4, 5];
export const viaLiteralNoDefault = [iterName, second];

// a plain instance leaf beside the pattern value shares the SAME memo ref across the eager
// (plain leaf) and deferred (pattern value) paths
const { [Symbol.iterator]: { length: arity = [6].at(0) }, flat: f } = [1, [2]];
export const viaMixedLeaf = [arity, f];

// member receiver was already deferred - the control keeps its shape
const { [Symbol.iterator]: { next: memberNext = [7].flat() }, tail } = holder.list;
export const viaMemberControl = [memberNext, tail];

// an SE inside the inner default survives exactly once, with the inner polyfill baked in
let se = () => {};
const { [Symbol.iterator]: { next: seNext = (se(), [1].toReversed()) }, third } = [8, 9];
export const viaSeDefault = [seNext, third];

// an SE computed key SIBLING keeps its effect in the residual (the deferred extract precedes
// it - the established channel order, locked by the sidecar)
let k = () => 'of';
const { [k()]: kf, [Symbol.iterator]: { name: nm = [2].at(0) } } = [3, 4];
export const viaSeKeySibling = [kf, nm];

// host variants keep the deferred routing: a `var` kind threads into the memo hoist, a
// multi-declarator declaration hosts the extraction beside its sibling declarators
var { [Symbol.iterator]: { next: varNext = [1].with(0, 2) }, fifth } = [10, 11];
export const viaVarKind = [varNext, fifth];
const before = 1, { [Symbol.iterator]: { name: midName = [2].entries() } } = [12], after = 2;
export const viaMultiDecl = [before, midName, after];

// the flush-time compose covers arbitrarily deep pattern-value nesting
const { [Symbol.iterator]: { next: { length: deepLen = [1].toSpliced(0, 1) } } } = [13];
export const viaDeepNesting = deepLen;

// two literal receivers in one declaration keep separate memos with no cross-poisoning
const { [Symbol.iterator]: { next: nx = [1].findLast(Boolean) } } = [14], { [Symbol.iterator]: { name: ny = [2].findLastIndex(Boolean) } } = [15];
export const viaTwoMemos = [nx, ny];
