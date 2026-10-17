import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$values from "@core-js/pure/actual/object/values";
const out = [];
{
  const written = {
    w: Object
  };
  const writtenAlias = written.w;
  written.w = Array;
  const viaWrittenSlot = _Object$values;
  _pushMaybeArray(out).call(out, viaWrittenSlot);
}
export { out };