import _Array$from from "@core-js/pure/actual/array/from";
var _ref;
// Returned selection arms use the same remaining path and candidate sink.
function c0() {
  return {
    a: Array
  };
}
function c1() {
  return {
    a: Array
  };
}
function c2() {
  return {
    a: first() ? c1() : c0()
  };
}
function c3() {
  return {
    a: second() ? c2() : c1()
  };
}
_ref = c3().a.a.a, _ref === Array ? _Array$from([3]) : _ref.from([3]);