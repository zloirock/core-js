import _at from "@core-js/pure/actual/instance/at";
// A var declared in this nested host belongs to its function.
// A closure write reaches the later read, so dispatch includes both receiver families.
export function f(c) {
  while (c) {
    var a = 'abc';
    w();
    use(_at(a).call(a, -1));
  }
  function w() {
    a = [1];
  }
}