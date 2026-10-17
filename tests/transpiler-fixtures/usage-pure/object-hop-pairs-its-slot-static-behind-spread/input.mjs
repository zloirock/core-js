// ... a STATIC claim behind the same spread keeps it too: the extraction takes the pure binding
// and the husk stays, so the read the spread performs still runs where the source wrote it
function staticBehindSpread(extra) {
  const { w: { Array: { from: aheadStatic } } } = { ...extra, w: globalThis };
  return aheadStatic;
}
export default [staticBehindSpread({})];
