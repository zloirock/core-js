import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Building the optional receiver memo must not scope a type-only rest parameter.
const o: {
  p?: number[];
} | undefined = JSON.parse('{"p":[4,8]}');
const cb = (..._args: unknown[]) => {};
class Box {
  value = (() => {
    var _ref;
    return [null == (_ref = o?.p) ? void 0 : _atMaybeArray(_ref).call(_ref, -1), cb as (...xs: number[]) => void];
  })();
}
export const r = new Box().value;