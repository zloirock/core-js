function f() {}
const out = [];
{
  const source = { w: Object };
  const handedWrapper = [source];
  f(handedWrapper);
  const viaHandedWrapper = handedWrapper[0].w.values;
  out.push(viaHandedWrapper);
}
export { out };
