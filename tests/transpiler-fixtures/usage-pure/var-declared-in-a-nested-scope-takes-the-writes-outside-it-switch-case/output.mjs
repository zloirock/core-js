import _keys from "@core-js/pure/actual/instance/keys";
import _Map from "@core-js/pure/actual/map/constructor";
// A var declared in this nested host belongs to its function.
// A closure write reaches the later read, so dispatch includes both receiver families.
export function f(c) {
  switch (c) {
    case 1:
      var e = [1];
      w();
      use(_keys(e).call(e));
  }
  function w() {
    e = new _Map();
  }
}