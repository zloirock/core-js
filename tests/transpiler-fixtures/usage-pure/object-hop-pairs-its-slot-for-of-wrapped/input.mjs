function forOfWrapped() {
  const out = [];
  for (const [{ w: { at: viaWrappedHead } }] of [[{ w: [1, 2] }]]) out.push(viaWrappedHead);
  return out;
}
export default [forOfWrapped()];
