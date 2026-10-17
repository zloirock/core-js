import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$values from "@core-js/pure/actual/object/values";
function f() {}
const out = [];
{
  const source = {
    w: Object
  };
  const handed = source.w;
  f(handed);
  const viaHanded = _Object$values;
  _pushMaybeArray(out).call(out, viaHanded);
}
export { out };