import _globalThis from "@core-js/pure/actual/global-this";
// The assignment is in the if branch and the use is in its sibling else branch.
// M is undefined at that use: keep the native read and its TypeError, without a Promise
// import or an identity guard for the unreachable realm value.
function f() {
  if (c) {
    var M = _globalThis;
  } else {
    M.Promise.allSettled([]);
  }
}