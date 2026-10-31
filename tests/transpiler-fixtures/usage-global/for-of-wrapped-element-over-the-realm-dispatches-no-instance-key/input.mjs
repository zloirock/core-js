// a for-of head's WRAPPED element types its slot through the wrapper level: a realm in the slot
// dispatches no instance key, so no typeless row is fabricated beside the head's own answer
function forOfWrappedRealm() {
  const out = [];
  for (const [{ w: { toReversed: headAt } }] of [[{ w: globalThis }]]) out.push(headAt);
  return out;
}
export default [forOfWrappedRealm()];
