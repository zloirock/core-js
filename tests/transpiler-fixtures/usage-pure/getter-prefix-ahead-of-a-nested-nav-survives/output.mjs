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
const {
    prototype: _ref
  } = (K.g, _globalThis.Array),
  m1 = _atMaybeArray(_ref),
  f1 = _flatMaybeArray(_ref);
const m2 = _copyWithinMaybeArray((K.g, _globalThis.Array.prototype));
const m3 = _findLastMaybeArray((K.g, Array.prototype));
const {
    prototype: _ref2
  } = (K.g, Array),
  m4 = _findMaybeArray(_ref2),
  f4 = _findIndexMaybeArray(_ref2);
const {
    prototype: _ref3
  } = (O.g, _globalThis.Array),
  m5 = _flatMapMaybeArray(_ref3),
  f5 = _withMaybeArray(_ref3);
let m6, f6;
K.g;
m6 = _toReversedMaybeArray(_globalThis.Array.prototype);
f6 = _toSortedMaybeArray(_globalThis.Array.prototype);
const m7 = _toSplicedMaybeArray((K.g, Array.prototype));
const [,] = [(K.g, _globalThis)];
const {
  prototype: _ref4
} = _globalThis.Array;
const m8 = _findLastIndexMaybeArray(_ref4);
const f8 = _includesMaybeArray(_ref4);
const [, _ref5] = [(K.g, _globalThis), 1];
const m9 = _sortMaybeArray(_globalThis.Array.prototype);
const z9 = _ref5;
for (const {
    prototype: _ref6
  } = (K.g, _globalThis.Array), m10 = _entriesMaybeArray(_ref6), f10 = _keysMaybeArray(_ref6);;) break;
const {
    prototype: _ref7
  } = (K.g, _globalThis.Array),
  m11 = _valuesMaybeArray(_ref7),
  f11 = _fillMaybeArray(_ref7);
export { m11, f11 };
use(m1, f1, m2, m3, m4, f4, m5, f5, m6, f6, m7, m8, f8, m9, z9, m11, f11);