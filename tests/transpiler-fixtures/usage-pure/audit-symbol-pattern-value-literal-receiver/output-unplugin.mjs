import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref2, _ref5, _ref7, _ref9, _ref11, _ref13, _ref14, _ref15, _ref16, _ref17;
// a pattern-VALUED Symbol.iterator prop (`[Symbol.iterator]: { ... }`) composes its extraction
// text from the pattern subtree, so it must drain at FLUSH, after the natural visitor rewrote
// the inner nodes - an eager visit-time compose on the constant-literal-receiver path lost the
// inner polyfill and its sentinel overwrite collided with the later inner transform, hard-
// aborting the whole file transform (the deferred member-memo path already drained correctly)

// the aborting seed: constant-literal receiver + inner polyfillable default + a sibling prop
const _ref = [1, 2, 3];
const { next = _flatMaybeArray(_ref2 = [1]).call(_ref2) } = _getIteratorMethod(_ref);
const { [_Symbol$iterator]: _unused, other } = _ref;
export const viaLiteralDefault = [next, other];

// no inner default - same routing, nothing to lose but the timing
const _ref3 = [4, 5];
const { name: iterName } = _getIteratorMethod(_ref3);
const { [_Symbol$iterator]: _unused2, second } = _ref3;
export const viaLiteralNoDefault = [iterName, second];

// a plain instance leaf beside the pattern value shares the SAME memo ref across the eager
// (plain leaf) and deferred (pattern value) paths
const _ref4 = [1, [2]];
const { length: arity = _atMaybeArray(_ref5 = [6]).call(_ref5, 0) } = _getIteratorMethod(_ref4);
const f = _flatMaybeArray(_ref4);
const { [_Symbol$iterator]: _unused3 } = _ref4;
export const viaMixedLeaf = [arity, f];

// member receiver was already deferred - the control keeps its shape
const _ref6 = holder.list;
const { next: memberNext = _flatMaybeArray(_ref7 = [7]).call(_ref7) } = _getIteratorMethod(_ref6);
const { [_Symbol$iterator]: _unused4, tail } = _ref6;
export const viaMemberControl = [memberNext, tail];

// an SE inside the inner default survives exactly once, with the inner polyfill baked in
let se = () => {};
const _ref8 = [8, 9];
const { next: seNext = (se(), _toReversedMaybeArray(_ref9 = [1]).call(_ref9)) } = _getIteratorMethod(_ref8);
const { [_Symbol$iterator]: _unused5, third } = _ref8;
export const viaSeDefault = [seNext, third];

// an SE computed key SIBLING keeps its effect in the residual (the deferred extract precedes
// it - the established channel order, locked by the sidecar)
let k = () => 'of';
const _ref10 = [3, 4];
const { name: nm = _atMaybeArray(_ref11 = [2]).call(_ref11, 0) } = _getIteratorMethod(_ref10);
const { [k()]: kf, [_Symbol$iterator]: _unused6 } = _ref10;
export const viaSeKeySibling = [kf, nm];

// host variants keep the deferred routing: a `var` kind threads into the memo hoist, a
// multi-declarator declaration hosts the extraction beside its sibling declarators
var _ref12 = [10, 11];
var { next: varNext = _withMaybeArray(_ref13 = [1]).call(_ref13, 0, 2) } = _getIteratorMethod(_ref12);
var { [_Symbol$iterator]: _unused7, fifth } = _ref12;
export const viaVarKind = [varNext, fifth];
const before = 1, { [_Symbol$iterator]: { name: midName = _entriesMaybeArray(_ref14 = [2]).call(_ref14) } } = [12], after = 2;
export const viaMultiDecl = [before, midName, after];

// the flush-time compose covers arbitrarily deep pattern-value nesting
const { next: { length: deepLen = _toSplicedMaybeArray(_ref15 = [1]).call(_ref15, 0, 1) } } = _getIteratorMethod([13]);
export const viaDeepNesting = deepLen;

// two literal receivers in one declaration keep separate memos with no cross-poisoning
const { [_Symbol$iterator]: { next: nx = _findLastMaybeArray(_ref16 = [1]).call(_ref16, Boolean) } } = [14], { [_Symbol$iterator]: { name: ny = _findLastIndexMaybeArray(_ref17 = [2]).call(_ref17, Boolean) } } = [15];
export const viaTwoMemos = [nx, ny];