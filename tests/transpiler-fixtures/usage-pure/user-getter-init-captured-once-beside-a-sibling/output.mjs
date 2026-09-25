import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$try from "@core-js/pure/actual/promise/try";
var _ref6;
// a user GETTER typed to a constructor (`KE.A`, `OE.A`) under a nested instance claim beside a
// sibling is read ONCE: one capture serves the nested claim and the sibling alike - beside a static,
// a residual, two nested claims, exported, beside a sibling declarator, in an assignment and with the
// static written first; `Array` itself needs none
class KE {
  static get A() {
    log();
    return Array;
  }
  static get I() {
    log();
    return _Iterator;
  }
  static get P() {
    log();
    return _Promise;
  }
}
const OE = {
  get A() {
    log();
    return Array;
  }
};
const _ref = KE.A;
const m1 = _at(_ref.prototype);
const a1 = _Array$from;
const _ref2 = KE.A;
const m2 = _flatMaybeArray(_ref2.prototype);
const {
  foo: r2
} = _ref2;
const _ref3 = KE.A;
const _ref4 = _ref3.prototype;
const m3 = _withMaybeArray(_ref4);
const f3 = _toSortedMaybeArray(_ref4);
const {
  bar: a3
} = _ref3;
const _ref5 = OE.A;
const m4 = _findLastMaybeArray(_ref5.prototype);
const a4 = _Array$fromAsync;
export const {
  prototype: {
    drop: m5
  }
} = KE.I;
export const a5 = _Iterator$concat;
const z6 = 1;
const {
  prototype: {
    take: m6
  }
} = KE.I;
const a6 = _Iterator$from;
const m7 = _flatMapMaybeArray(Array.prototype);
const {
  isArray: a7
} = Array;
let m8, a8;
_ref6 = KE.A, m8 = _toReversedMaybeArray(_ref6.prototype), a8 = _Array$of, _ref6;
const _ref7 = KE.P,
  a9 = _Promise$try,
  {
    prototype: {
      finally: m9
    }
  } = _ref7;
use(m1, a1, m2, r2, m3, f3, a3, m4, a4, z6, m6, a6, m7, a7, m8, a8, a9, m9);