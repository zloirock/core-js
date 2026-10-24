// Known static slots and computed symbol keys receive their own pure entries.
// Constructor rest reads the symbol slot and remaining keys from the full index.
const { Array: { [Symbol.iterator]: a } } = globalThis;
a;
const { Map: { [Symbol.iterator]: m } } = globalThis;
m;
const { Object: { [Symbol.iterator]: o, fromEntries: fe } } = globalThis;
o;
fe(x);
const { Set: { [Symbol.iterator]: s, ...ri } } = globalThis;
s;
ri;
