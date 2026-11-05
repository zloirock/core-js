// A literal-object for-of element keeps its native nested Map read.
// The independent body push call remains polyfilled.
function forOfHop() {
  const out = [];
  for (const { w: { Map: viaHeadCtor } } of [{ w: globalThis }]) out.push(viaHeadCtor);
  return out;
}
export default [forOfHop()];
