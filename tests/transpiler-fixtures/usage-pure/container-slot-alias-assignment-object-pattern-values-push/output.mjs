import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _values from "@core-js/pure/actual/instance/values";
import _Map from "@core-js/pure/actual/map";
const out = [];
{
  const source = {
    w: Object
  };
  const wrapperWritten = {
    k: source
  };
  // This write definitely replaces source.w; only instance dispatch remains, without an Object guard.
  wrapperWritten.k.w = _Map;
  const viaWrapperWritten = _values(source.w);
  _pushMaybeArray(out).call(out, viaWrapperWritten);
}
export { out };