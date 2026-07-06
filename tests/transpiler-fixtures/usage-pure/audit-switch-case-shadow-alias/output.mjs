import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
// a case-level lexical rebind (`case 1: let name`) lives in the switch's SINGLE case-block
// env: writes in EVERY case target that inner binding, so the outer alias keeps resolving -
// the reassignment scan must halt at the switch instead of recording a spurious violation
// (it bailed the resolution on one emitter only, a decision desync). a BRACED case body, the
// DISCRIMINANT (evaluated in the outer env), a case-level `var` (function-hoisted) and a plain
// case write without a shadow are the boundaries. distinct constructor per cell
export function caseLetShadow(cond, mk) {
  let M = Array;
  switch (cond) {
    case 1:
      let M = mk();
      M = mk();
  }
  return _Array$from([1]);
}
export function crossCaseWrite(cond, mk) {
  let P = Object;
  switch (cond) {
    case 1:
      const P = mk();
      break;
    default:
      P = mk();
  }
  return _Object$fromEntries([["a", 1]]);
}
export function caseClassShadow(cond, mk) {
  let S = String;
  switch (cond) {
    case 1:
      class S {}
      mk(S);
  }
  return _String$fromCodePoint(66);
}
export function bracedCaseControl(cond, mk) {
  let A = Array;
  switch (cond) {
    case 1:
      {
        let A = mk();
        A = mk();
      }
  }
  return _Array$of(2);
}
// boundaries: these writes target the OUTER binding and must keep bailing the resolution
export function noShadowRealWrite(cond, mk) {
  let Q = _Promise;
  switch (cond) {
    case 1:
      Q = mk();
  }
  return Q.allSettled([1]);
}
export function discriminantWrite(mk) {
  let D = Number;
  switch (D = mk()) {
    case 1:
      let D = 0;
      mk(D);
  }
  return D.parseFloat("1.5");
}
export function caseVarOverwrite(cond, mk) {
  var R = _Reflect;
  switch (cond) {
    case 1:
      var R = mk();
  }
  return R.ownKeys({
    a: 1
  });
}
// a write buried in a DISCRIMINANT closure may run (the callee is unknown) and per spec targets
// the OUTER binding - the resolution must bail even though a case-level lexical shadows the name
export function discriminantClosureWrite(mk) {
  let W = _Map;
  switch (mk(() => {
    W = mk();
  })) {
    case 1:
      let W = 0;
      mk(W);
  }
  return W.groupBy([1, 2], x => x % 2);
}