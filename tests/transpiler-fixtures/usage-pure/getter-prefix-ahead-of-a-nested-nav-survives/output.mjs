import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _sortMaybeArray from "@core-js/pure/actual/array/instance/sort";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _globalThis from "@core-js/pure/actual/global-this";
// a getter-read prefix element (`K.g`, `O.g`) ahead of a NESTED prototype or surface nav is work the
// source does: every host that elides the prefix to reach the nav keeps the read, once, in the order
// the source ran it - declaration, assignment, literal slot, array wrapper, loop head, export
class K {
  static get g() {
    log();
    return 0;
  }
}
const O = {
  get g() {
    log();
    return 0;
  }
};
K.g;
const m1 = _atMaybeArray(_globalThis.Array.prototype);
const f1 = _flatMaybeArray(_globalThis.Array.prototype);
const m2 = _copyWithinMaybeArray((K.g, _globalThis.Array.prototype));
const m3 = _findLastMaybeArray((K.g, Array.prototype));
K.g;
const m4 = _findMaybeArray(Array.prototype);
const f4 = _findIndexMaybeArray(Array.prototype);
O.g;
const m5 = _flatMapMaybeArray(_globalThis.Array.prototype);
const f5 = _withMaybeArray(_globalThis.Array.prototype);
let m6, f6;
K.g;
m6 = _toReversedMaybeArray(_globalThis.Array.prototype);
f6 = _toSortedMaybeArray(_globalThis.Array.prototype);
const m7 = _toSplicedMaybeArray((K.g, Array.prototype));
K.g;
const m8 = _findLastIndexMaybeArray(_globalThis.Array.prototype);
const f8 = _includesMaybeArray(_globalThis.Array.prototype);
K.g;
const m9 = _sortMaybeArray(_globalThis.Array.prototype);
const [{}, z9] = [_globalThis, 1];
for (const _unused = (K.g, _globalThis), m10 = _entriesMaybeArray(_globalThis.Array.prototype), f10 = _keysMaybeArray(_globalThis.Array.prototype);;) break;
K.g;
export const m11 = _valuesMaybeArray(_globalThis.Array.prototype);
export const f11 = _fillMaybeArray(_globalThis.Array.prototype);
use(m1, f1, m2, m3, m4, f4, m5, f5, m6, f6, m7, m8, f8, m9, z9, m11, f11);