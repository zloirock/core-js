import _includes from "@core-js/pure/actual/instance/includes";
// A var declared in this nested host belongs to its function.
// A closure write reaches the later read, so dispatch includes both receiver families.
export function f(c) {
  {
    var b = 'abc';
    w();
    use(_includes(b).call(b, 'a'));
  }
  function w() {
    b = [1];
  }
}