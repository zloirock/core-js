// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Reads and effects remain inside their source control-flow positions. Instance claims retain their own receivers.
function forOfHop() {
  const out = [];
  for (const { w: { Map: viaHeadCtor } } of [{ w: globalThis }]) out.push(viaHeadCtor);
  return out;
}
export default [forOfHop()];
