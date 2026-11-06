import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
const out = [];
{
  const source = {
    w: Object
  };
  let reassigned = source.w;
  reassigned = Array;
  const viaReassigned = reassigned.values;
  _pushMaybeArray(out).call(out, viaReassigned);
}
export { out };