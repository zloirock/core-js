import _at from "@core-js/pure/actual/instance/at";
function f() {
  return foo(_at(this).call(this, 0), _at(this).call(this, 1));
}