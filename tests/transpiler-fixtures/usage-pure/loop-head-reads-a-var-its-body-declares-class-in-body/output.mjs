import _Array$of from "@core-js/pure/actual/array/of";
const K = Array;
export function classInBody() {
  for (var i = _Array$of(4); !i;) {
    class K {}
    i = K;
  }
  return i;
}