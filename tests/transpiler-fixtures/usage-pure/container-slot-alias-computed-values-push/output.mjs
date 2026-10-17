import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _values from "@core-js/pure/actual/instance/values";
function f() {}
const out = [];
{
  const source = {
    w: Object
  };
  const handedWrapper = [source];
  f(handedWrapper);
  const viaHandedWrapper = _values(handedWrapper[0].w);
  _pushMaybeArray(out).call(out, viaHandedWrapper);
}
export { out };