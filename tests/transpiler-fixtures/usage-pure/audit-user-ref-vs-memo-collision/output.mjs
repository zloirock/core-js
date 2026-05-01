import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
var _ref2, _ref3;
// Force plugin to allocate `_ref` for receiver memo on `getX().method()`.
// User has already declared `_ref`, so plugin must skip past it on its
// own UID allocation. Forces real interaction between user-declared
// `_ref` shadow and plugin allocator
let _ref = "preserved";
function getArr() {
  return [1, 2, 3];
}
function getOther() {
  return [4, 5, 6];
}
_atMaybeArray(_ref2 = getArr()).call(_ref2, -1);
_findLastMaybeArray(_ref3 = getOther()).call(_ref3, x => x > 0);
console.log(_ref);