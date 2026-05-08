import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
var _ref, _ref2;
// Outer generic `T` threads into a TS 4.7 instantiation expression `typeof makeBox<T>` inside `ReturnType`.
// Substitution must recurse into the inner typeParameters so `items` resolves to `number[]`, not raw `T`.
declare function makeBox<U>(): { items: U };
interface Container<T> {
  box: ReturnType<typeof makeBox<T>>;
}
declare const c: Container<number[]>;
const head = _atMaybeArray(_ref = c.box.items).call(_ref, 0);
const idx = _findLastIndexMaybeArray(_ref2 = c.box.items).call(_ref2, x => x > 0);
export { head, idx };