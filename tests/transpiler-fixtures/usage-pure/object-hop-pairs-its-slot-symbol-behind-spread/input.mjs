// The spread reads precede the symbol extraction, as they preceded the native pattern read.
function symbolBehindSpread(extra) {
  const { w: { [Symbol.iterator]: aheadSymbol } } = { ...extra, w: globalThis };
  return aheadSymbol;
}
const events = [];
const method = symbolBehindSpread({ get w() { events.push('spread'); return null; } });
export default [method, events];
