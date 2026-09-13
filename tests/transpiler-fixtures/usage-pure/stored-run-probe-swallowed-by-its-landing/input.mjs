// A plain navigation ending at a backed value does not invent a guard for a
// middle environment hop. Storing that value preserves writes and key effects.
// A source optional over a terminal environment probe remains live, and a
// stored terminal probe keeps its final read instead of becoming the realm.
// A source optional inside the navigation also keeps its original short-circuit.
let a, b, c, d, e, f, g, h, m;
let k = 0;
export const swallowedProbe = (a = globalThis.window.self.Number)?.isInteger(1);
export const readThroughProbe = (b = globalThis.self.window.Object)?.getOwnPropertyNames({});
export const plainClaimTwin = (c = globalThis.window.self.Number).parseFloat('1.5');
export const foldedThenSwallowed = (f = globalThis.window.self.window.Object)?.getOwnPropertySymbols({});
export const vestigialOverTheLanding = (g = globalThis.window.self?.Number)?.parseInt('7', 10);
export const sourceOptionalOverAFoldedHop = (h = globalThis.window.self.window?.Number)?.isInteger(3);
export const probeAboveTheRootLanding = (e = globalThis.window.Symbol)?.for('fc362');
export const sourceWroteTheHop = (d = globalThis.window?.self.Array)?.from([1]);
export const prefixLeafIsTheProbe = (m = globalThis.window.self[(k++, 'window')])?.Number.isInteger(1);
// A computed unbacked prefix preserves the optional over the next constructor read.
export const computedPrefixProbe = (a = globalThis.window?.self['window']?.Array)?.of(1);
export const computedPrefixPlain = (b = globalThis.window?.self['window'].Array)?.from([]);
export const dottedPrefixProbe = (c = globalThis.window?.self.window?.Number)?.isFinite(1);
export { a, b, c, d, e, f, g, h, k, m };
