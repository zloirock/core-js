import _values from "@core-js/pure/actual/instance/values";
import _Set from "@core-js/pure/actual/set/constructor";
// A var declared in this nested host belongs to its function.
// A closure write reaches the later read, so dispatch includes both receiver families.
export function f(c) {
  try {
    g();
  } catch {
    var d = [1];
    w();
    use(_values(d).call(d));
  }
  function w() {
    d = new _Set();
  }
}