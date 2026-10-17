function f() {}
const out = [];
{
  const source = { w: Object };
  const handed = source.w;
  f(handed);
  const viaHanded = handed.values;
  out.push(viaHanded);
}
export { out };
