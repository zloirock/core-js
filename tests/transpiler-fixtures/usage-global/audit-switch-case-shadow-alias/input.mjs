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
  return M.from([1]);
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
  return P.fromEntries([["a", 1]]);
}
export function caseClassShadow(cond, mk) {
  let S = String;
  switch (cond) {
    case 1:
      class S {}
      mk(S);
  }
  return S.fromCodePoint(66);
}
export function bracedCaseControl(cond, mk) {
  let A = Array;
  switch (cond) {
    case 1: {
      let A = mk();
      A = mk();
    }
  }
  return A.of(2);
}
// boundaries: these writes target the OUTER binding and must keep bailing the resolution
export function noShadowRealWrite(cond, mk) {
  let Q = Promise;
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
  var R = Reflect;
  switch (cond) {
    case 1:
      var R = mk();
  }
  return R.ownKeys({ a: 1 });
}
// a write buried in a DISCRIMINANT closure may run (the callee is unknown) and per spec targets
// the OUTER binding - the resolution must bail even though a case-level lexical shadows the name
export function discriminantClosureWrite(mk) {
  let W = Map;
  switch (mk(() => { W = mk(); })) {
    case 1:
      let W = 0;
      mk(W);
  }
  return W.groupBy([1, 2], x => x % 2);
}
