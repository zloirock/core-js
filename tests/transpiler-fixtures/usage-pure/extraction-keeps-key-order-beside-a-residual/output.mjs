import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
var _ref, _ref2, _ref3, _ref4;
// an extraction beside a SURVIVING residual keeps the source's key order: a member target's setter,
// a user getter the residual reads and a binding written before them all observe it - the ordered
// capture holds every key in its slot where a crossed operation runs code
class C {
  static get name() {
    log();
    return 'C';
  }
  static groupBy = 1;
}
function user() {
  log();
  return C;
}
function effIterator() {
  log();
  return _Iterator;
}
function effArray() {
  log();
  return Array;
}
const ob = {
  set a(v) {
    log(v);
  },
  set b(v) {
    log(v);
  },
  set f(v) {
    log(v);
  }
};
_ref = effIterator(), ob.a = _Iterator$from, _ref2 = _ref, ob.b = _nameMaybeFunction(_ref2), _ref2, _ref;
let s0, nm;
_ref3 = user(), {
  groupBy: s0
} = _ref3, nm = _nameMaybeFunction(_ref3), _ref3;
let x;
_ref4 = effArray(), x = _Array$fromAsync, {
  isArray: ob.f
} = _ref4, _ref4;
use(s0, nm, x);