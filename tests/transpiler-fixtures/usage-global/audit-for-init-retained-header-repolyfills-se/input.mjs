// usage-global guard for the retained `for` header: this method only ADDS imports and never
// rewrites the header, so the whole matrix must stay import-only however the pure receiver
// collapse, its re-emitted effects and their memo placement are resolved
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
