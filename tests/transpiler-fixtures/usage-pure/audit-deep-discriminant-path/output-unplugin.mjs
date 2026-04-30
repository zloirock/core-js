import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type Wrap = { meta: { kind: 'a'; data: string[] } | { kind: 'b'; data: number } };

function process(w: Wrap) {
  if (w.meta.kind === 'a') {
var _ref;
    return _atMaybeArray(_ref = w.meta.data).call(_ref, 0);
  }
  return w.meta.data;
}