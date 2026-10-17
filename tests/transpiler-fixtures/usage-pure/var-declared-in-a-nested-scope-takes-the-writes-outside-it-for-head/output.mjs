import _entries from "@core-js/pure/actual/instance/entries";
import _Set from "@core-js/pure/actual/set/constructor";
// A var declared in this nested host belongs to its function.
// A closure write reaches the later read, so dispatch includes both receiver families.
export function f(c) {
  for (var h = [1]; c;) {
    w();
    use(_entries(h).call(h));
  }
  function w() {
    h = new _Set();
  }
}