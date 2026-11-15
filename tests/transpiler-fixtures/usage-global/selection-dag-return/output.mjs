import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
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
c3().a.a.a.from([3]);