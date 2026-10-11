// usage-global rewrites none of these statements: a listed statement holding a decided test's answer loads
// the modules of the global its test reads however the test is wrapped - in parens, a TS cast or a `!` - and
// so does one standing alone in an arm or read as a value; the install the test guards, which never runs,
// still loads the realm it writes through
(typeof Symbol == 'undefined' && (globalThis.Symbol = SymbolShim));
((typeof Map == 'undefined' && (globalThis.Map = MapShim))) as unknown;
(typeof Set == 'undefined' && (globalThis.Set = SetShim))!;
if (ready) (typeof WeakMap == 'undefined' && (globalThis.WeakMap = WeakMapShim));
export const installed = (typeof WeakSet == 'undefined' && (globalThis.WeakSet = WeakSetShim));
