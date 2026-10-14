// A call off a constructor read past a live `?.` of the realm probe, its iterator key running an effect: the
// guard holds the key's effect with the read, so neither runs where the probe short-circuits.
let n = 0;
globalThis.window?.Map[(n++, Symbol.iterator)]();
export { n };
