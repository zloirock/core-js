const shim = 0;
const out = [];
{
  const source = { w: Object };
  const patched = source.w;
  patched.getOwnPropertySymbols = shim;
  const viaPatched = patched.getOwnPropertySymbols;
  out.push(viaPatched);
}
export { out };
