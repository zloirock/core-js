// Nested Symbol.iterator pattern values keep inner defaults and their polyfills intact.
// Literal and member receivers preserve property order across sibling properties,
// computed keys, declaration hosts and deeper nested patterns.
// Each receiver is evaluated once and unrelated receiver captures remain independent.

// A literal receiver combines an inner polyfillable default with a sibling property.
const { [Symbol.iterator]: { next = [1].flat() }, other } = [1, 2, 3];
export const viaLiteralDefault = [next, other];

// A nested name read keeps the iterator function name available.
const { [Symbol.iterator]: { name: iterName }, second } = [4, 5];
export const viaLiteralNoDefault = [iterName, second];

// A plain instance leaf beside a pattern value uses the same captured receiver.
const { [Symbol.iterator]: { length: arity = [6].at(0) }, flat: f } = [1, [2]];
export const viaMixedLeaf = [arity, f];

// A member receiver is read once before nested extraction.
const { [Symbol.iterator]: { next: memberNext = [7].flat() }, tail } = holder.list;
export const viaMemberControl = [memberNext, tail];

// An effect inside the inner default runs once, with its inner polyfill preserved.
let se = () => {};
const { [Symbol.iterator]: { next: seNext = (se(), [1].toReversed()) }, third } = [8, 9];
export const viaSeDefault = [seNext, third];

// A computed sibling key runs before the following iterator read and nested default.
let k = () => 'of';
const { [k()]: kf, [Symbol.iterator]: { name: nm = [2].at(0) } } = [3, 4];
export const viaSeKeySibling = [kf, nm];

// Declaration kinds and neighboring declarators retain source order for nested extraction.
var { [Symbol.iterator]: { next: varNext = [1].with(0, 2) }, fifth } = [10, 11];
export const viaVarKind = [varNext, fifth];
const before = 1, { [Symbol.iterator]: { name: midName = [2].entries() } } = [12], after = 2;
export const viaMultiDecl = [before, midName, after];

// Nested defaults keep their polyfills through deeper pattern values.
const { [Symbol.iterator]: { next: { length: deepLen = [1].toSpliced(0, 1) } } } = [13];
export const viaDeepNesting = deepLen;

// Two literal receivers in one declaration keep independent captures.
const { [Symbol.iterator]: { next: nx = [1].findLast(Boolean) } } = [14], { [Symbol.iterator]: { name: ny = [2].findLastIndex(Boolean) } } = [15];
export const viaTwoMemos = [nx, ny];
