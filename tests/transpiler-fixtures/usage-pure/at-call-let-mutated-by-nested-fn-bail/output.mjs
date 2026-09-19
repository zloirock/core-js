import _at from "@core-js/pure/actual/instance/at";
let x = 'hello';
function mutate() {
  x = 42;
}
function f() {
  if (typeof x === 'string') {
    mutate();
    _at(x).call(x, 0);
  }
}