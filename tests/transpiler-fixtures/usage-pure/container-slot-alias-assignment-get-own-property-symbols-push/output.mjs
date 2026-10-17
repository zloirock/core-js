import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
const shim = 0;
const out = [];
{
  const source = {
    w: Object
  };
  const patched = source.w;
  patched.getOwnPropertySymbols = shim;
  const viaPatched = patched.getOwnPropertySymbols;
  _pushMaybeArray(out).call(out, viaPatched);
}
export { out };