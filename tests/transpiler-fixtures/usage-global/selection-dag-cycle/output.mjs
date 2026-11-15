import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Returning through a cycle must retain every reachable constructor candidate.
const flag = choose();
function f0() {
  return flag ? Array : f1();
}
function f1() {
  return flag ? f0() : Object;
}
function f2() {
  return flag ? f1() : f0();
}
function f3() {
  return flag ? f2() : f1();
}
f3().from([3]);