import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Set from "@core-js/pure/actual/set/constructor";
let D = _Set;
function define() {
  return class {
    static held = D = Array;
    [(D = _Iterator, 'd')] = 1;
  };
}
export const fromLater = () => (D === Array ? _Array$from : D === _Iterator ? _Iterator$from : D.from.bind(D))([1]);