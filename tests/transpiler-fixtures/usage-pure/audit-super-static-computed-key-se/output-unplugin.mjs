import _Array$from from "@core-js/pure/actual/array/from";
// computed-key on super-static call where the key carries a side-effect prefix;
// the side effect must run at the original evaluation point
let log = 0;
function fn() {
  log++;
  return 'from';
}
class C extends Array {
  static m() {
    return (fn(), _Array$from.call(this, [1, 2, 3]));
  }
}
C.m();
log;