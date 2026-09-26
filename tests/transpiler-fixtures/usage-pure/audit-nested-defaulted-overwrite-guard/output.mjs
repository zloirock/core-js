import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
// a DEFAULTED instance leaf whose claim is emitted as a post-statement OVERWRITE: the pure entry
// answers `it.method` VERBATIM off a receiver that is not the polyfilled surface, so the dispatch
// may be undefined and an unguarded overwrite bound that undefined over the value the destructure
// had already assigned. what stands in that case is whatever ran the default exactly ONCE: the raw
// SLOT while it survives (its binding holds the read or the source's own default), and the default
// NODE once the slot is pruned - nothing ran it then, and the guard is its only reader
declare const recvF: {
  codes: number[];
};
declare const src: number[];
declare const holder: {
  flat?: () => number[];
};
let m, q, s, n;
m = (_ref = _flatMaybeArray(holder)) === void 0 ? null : _ref;
[_ref2] = [src];
q = (_ref3 = _flatMaybeArray(_ref2)) === void 0 ? 7 : _ref3;
_ref4 = src, null == _ref4 ? _ref4[""] : (eff(), s = (_ref5 = _flatMaybeArray(_ref4)) === void 0 ? 7 : _ref5), _ref4;
// a BUILT-IN surface nav is spelled by the overwrite, and the consumed slot leaves with it: the
// dispatch is then the only reader of `globalThis.Array.prototype`, so the default node is spelled
let c;
// a USER key hop the extraction OWNS is re-spelled where the source reads it: `recvF.codes` is read
// once, by the dispatch alone, once the consumed slot drops the host - the declaration host's answer
c = (_ref6 = _flatMaybeArray(_globalThis.Array.prototype)) === void 0 ? null : _ref6;
// ... but a CAPITALISED hop off a user object reaching a real INSTANCE surface takes the overwrite
// once its slot drops the nav: `userNs.Array.prototype` is then read exactly where the source reads
// it, once - the double read the re-read gate forbids needs a residual that survives beside it
n = (_ref7 = _findIndexMaybeArray(recvF.codes)) === void 0 ? null : _ref7;
declare const userNs: {
  Array: {
    prototype: number[];
  };
};
let fromUserNs;
fromUserNs = _flatMaybeArray(userNs.Array.prototype);
export { m, q, s, c, n, fromUserNs };