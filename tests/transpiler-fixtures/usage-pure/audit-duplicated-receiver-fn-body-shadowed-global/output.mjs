import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Set from "@core-js/pure/actual/set/constructor";
// The function body inside a single captured receiver is polyfilled in its own scope. Its local Map
// remains unchanged, while the free Set is substituted. The instance method and outer sibling read
// that same captured object.
const _ref = {
  y: [() => {
    const Map = 1;
    return [Map, _Set];
  }],
  k: 1
};
const a = _atMaybeArray(_ref.y);
const {
  k
} = _ref;
export const r = [a, k];