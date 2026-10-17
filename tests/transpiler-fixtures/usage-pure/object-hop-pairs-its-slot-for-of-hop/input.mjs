function forOfHop() {
  const out = [];
  for (const { w: { Map: viaHeadCtor } } of [{ w: globalThis }]) out.push(viaHeadCtor);
  return out;
}
export default [forOfHop()];
