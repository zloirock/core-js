import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Reflect$isExtensible from "@core-js/pure/actual/reflect/is-extensible";
// A `||` whose left is an `&&` or a conditional the build decides to an object literal never runs its
// right: the literal is always truthy. usage-pure folds the selection to that literal, and a static read
// through its slot takes the left's constructor alone, whether the selection is held in a const or read
// in place
const box = {
  C: _Map
};
export const held = () => _Map$groupBy([1], x => x);
export const inPlace = x => _Reflect$isExtensible(x);
export const ternary = () => _Array$of(1);