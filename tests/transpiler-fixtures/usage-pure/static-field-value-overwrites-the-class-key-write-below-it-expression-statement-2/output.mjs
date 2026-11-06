import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
let D = _Set;
function define() {
  return class {
    static held = D = Array;
    [(D = _Iterator, 'd')] = 1;
  };
}
define();