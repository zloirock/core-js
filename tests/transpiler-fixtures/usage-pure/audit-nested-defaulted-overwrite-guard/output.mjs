import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _ref4, _ref5;
// a DEFAULTED instance leaf extracted as an assignment after its pattern: the dispatch answers the
// receiver's own member when the receiver is not the polyfilled surface, so it may be undefined, and
// the extraction guards it and falls back to the source's default, run exactly once. a realm surface
// nav and a user key hop are read once, by the dispatch; a capitalized hop off a user object is that
// object's own typed nav, read once where the source reads it.
declare const recvF: {
  codes: number[];
};
declare const src: number[];
declare const holder: {
  flat?: () => number[];
};
let m, q, s, n;
m = (_ref = _flatMaybeArray(holder)) === void 0 ? null : _ref;
[,] = [src];
q = (_ref2 = _atMaybeArray(src)) === void 0 ? 7 : _ref2;
({} = src), eff(), s = (_ref3 = _includesMaybeArray(src)) === void 0 ? 7 : _ref3;
let c;
c = (_ref4 = _copyWithinMaybeArray(_globalThis.Array.prototype)) === void 0 ? null : _ref4;
n = (_ref5 = _findIndexMaybeArray(recvF.codes)) === void 0 ? null : _ref5;
declare const userNs: {
  Array: {
    prototype: number[];
  };
};
let fromUserNs;
fromUserNs = _flatMapMaybeArray(userNs.Array.prototype);
export { m, q, s, c, n, fromUserNs };