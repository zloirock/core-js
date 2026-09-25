import _Array$from from "@core-js/pure/actual/array/from";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _Error$isError from "@core-js/pure/actual/error/is-error";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Math$sumPrecise from "@core-js/pure/actual/math/sum-precise";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// a `var` initialized in a BRANCH still names the value a later reassigning WRITE takes from it: the
// write keeps its own read, so the init need only be able to have run by then - through a member, a
// container slot, a nested slot, a computed key, an array slot, an else arm and a loop body
let a1 = _Set;
function g1() {
  if (on) {
    var ns = _globalThis;
  }
  a1 = ns.Array;
}
let a2 = _Set;
function g2() {
  if (on) {
    var box = {
      A: _Iterator
    };
  }
  a2 = box.A;
}
let a3 = _Set;
function g3() {
  if (on) {
    var box = {
      w: {
        P: _Promise
      }
    };
  }
  a3 = box.w.P;
}
let a4 = _Set;
function g4() {
  if (on) {
    var K = 'Object';
  }
  a4 = _globalThis[K];
}
let a5 = _Set;
function g5() {
  if (on) {
    var list = [Math];
  }
  a5 = list[0];
}
let a6 = _Set;
function g6() {
  if (on) {
    var ns = _globalThis;
  } else {
    a6 = _WeakMap;
  }
  a6 = ns.Error;
}
let a7 = _Set;
function g7() {
  for (const x of [1]) {
    var ns = _globalThis;
  }
  a7 = ns === _globalThis ? _Map : ns.Map;
}
use(g1, g2, g3, g4, g5, g6, g7);
use(a1 === Array ? _Array$from : a1.from, a2 === _Iterator ? _Iterator$concat : _concatMaybeArray(a2), a3 === _Promise ? _Promise$try : a3.try, a4 === Object ? _Object$fromEntries : a4.fromEntries, a5 === Math ? _Math$sumPrecise : a5.sumPrecise, a6 === Error ? _Error$isError : a6.isError, a7 === _Map ? _Map$groupBy : a7.groupBy);