import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
var _ref2, _ref3, _ref4, _ref5, _ref6;
// TS/accessor member names are SOURCE-TEXT names, never runtime references. two independent consequences,
// both locked here:
//   1. a UID-shaped name in such a slot must NOT reserve the slot, so the memo takes the LOW number - a
//      type-space property signature, an enum member, an `accessor` key and an `abstract` property key.
//      METHOD-shaped signatures are the boundary: babel's live scope does claim those, so they still
//      reserve and the memo there takes the NEXT number.
//   2. a GLOBAL-shaped key must NOT be rewritten to the polyfill import - an `abstract` member key named
//      `Map` stays `Map` (renaming it would silently change the class contract).
// distinct method per line.
interface Sig { _ref: number }
export const r1 = _atMaybeArray(_ref2 = [10, 20]).call(_ref2, 0);
enum Members { _ref }
export const r2 = _flatMaybeArray(_ref3 = [[1], [2]]).call(_ref3);
class Acc { accessor _ref = 1; }
export const r3 = _includesMaybeArray(_ref4 = [3, 4]).call(_ref4, 3);
abstract class AbsProp { abstract _ref: number; }
export const r4 = _findLastMaybeArray(_ref5 = [5, 6]).call(_ref5, x => x > 5);
abstract class Contract { abstract Map: number; abstract Promise(): void; }
export const r5 = new _Map();
interface MethodSig { _ref(): void }
export const r6 = _findIndexMaybeArray(_ref6 = [7, 8]).call(_ref6, x => x === 7);
export type { Sig, MethodSig };
export { Members, Acc, AbsProp, Contract };