// a listed statement holding nothing but a decided test's answer leaves however the test is wrapped - in
// parens or a TS cast - as the bare statement does; one standing alone in an arm, or read as a value,
// keeps the answer
(typeof Symbol == 'undefined' && (globalThis.Symbol = SymbolShim));
((typeof Map == 'undefined' && (globalThis.Map = MapShim))) as unknown;
(typeof Set == 'undefined' && (globalThis.Set = SetShim))!;
if (ready) (typeof WeakMap == 'undefined' && (globalThis.WeakMap = WeakMapShim));
export const installed = (typeof WeakSet == 'undefined' && (globalThis.WeakSet = WeakSetShim));
