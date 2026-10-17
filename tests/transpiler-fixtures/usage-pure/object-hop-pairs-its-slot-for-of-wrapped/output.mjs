import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
function forOfWrapped() {
  const out = [];
  for (const _ref2 of [[{
    w: [1, 2]
  }]]) {
    const [_ref] = _ref2;
    const viaWrappedHead = _atMaybeArray(_ref.w);
    _pushMaybeArray(out).call(out, viaWrappedHead);
  }
  return out;
}
export default [forOfWrapped()];