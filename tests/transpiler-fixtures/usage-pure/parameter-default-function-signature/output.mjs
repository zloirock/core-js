import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Building the default's receiver memo must not scope a type-only object pattern.
const o: {
  p?: number[];
} | undefined = JSON.parse('{"p":[4,8]}');
const cb = (..._args: unknown[]) => {};
export function read(value = (() => {
  var _ref;
  return [null == (_ref = o?.p) ? void 0 : _atMaybeArray(_ref).call(_ref, -1), cb as ({
    x
  }: {
    x: number;
  }) => void];
})()) {
  return value[0];
}