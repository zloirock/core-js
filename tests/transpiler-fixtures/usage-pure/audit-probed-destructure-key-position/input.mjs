// pattern-hop (anchored) destructures over an UNDEFINABLE probe nav: the source read throws
// where the probe yields undefined, so every anchored render rides the guard-value spelling
// instead of the always-defined receiver / ctor bindings
// the probe key is POSITION-INDEPENDENT: both property orders reproduce the source's throw,
// and a string-literal / computed `[Symbol.iterator]` first key probes like the dotted one
export const { Set: { union: viaAnchoredFirstA }, Array: { of: viaAnchoredFirstB } } = globalThis.window?.self;
export const { Array: { of: viaConsumedFirstA }, Set: { union: viaConsumedFirstB } } = globalThis.window?.self;
export const { 'Array': { of: viaStringKeyFirst }, Set: { union: viaStringKeySibling } } = globalThis.window?.self;
export const { [Symbol.iterator]: viaSymbolFirst, Array: { of: viaSymbolSibling } } = globalThis.window?.self;
export const { [Symbol.iterator]: viaSymbolOnly } = globalThis.window?.self.Array.prototype;
