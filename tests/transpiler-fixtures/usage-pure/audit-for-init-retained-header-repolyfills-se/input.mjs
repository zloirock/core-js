// a `for` header is the only destructure host with no statement slot: its init stays IN the
// header instead of being lifted, so the pass that re-walks a lifted init never sees it. the
// receiver collapse re-emits its harvested effects as raw copies taken before those effects
// were themselves rewritten, so the header shipped them unpolyfilled - and the collapse itself
// stopped short, leaving the proxy root where every other position reads the constructor. a
// re-emitted effect that needs a memo carries no source range either, so the ref placement could
// not confirm itself against the loop body and landed the declaration inside it
const log = [];
const obj = { text: 'ab' };
const arr = [3, 1, 2];
let k;
function gf() { return globalThis; }
for (const { groupBy: g } = globalThis[(log.push('k'), 'Map')]; false; ) break;
for (const { any: a } = (arr.at(0), globalThis).Promise; false; ) break;
for (const { ownKeys: o } = gf()[(arr.flat(), 'Reflect')]; false; ) break;
for (const { for: s } = (k = globalThis)[(arr.includes(1), 'Symbol')]; false; ) break;
for (const { values: v } = globalThis[(arr.findLast(Boolean), 'Object')]; false; ) break;
for (const { asyncIterator: i } = globalThis[(obj.text.padStart(4, '.'), 'Symbol')]; false; ) break;
export { log, k };
