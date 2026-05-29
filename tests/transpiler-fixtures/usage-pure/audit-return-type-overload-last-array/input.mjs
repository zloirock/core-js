// ReturnType<typeof fn> on an overloaded ambient function resolves against the LAST overload
// signature (TS rule). The last head returns number[], so the result narrows to Array and
// `.at(0)` / `.findIndex(...)` emit the Array variants.
declare function fn(x: string): string;
declare function fn(x: number): number[];
type R = ReturnType<typeof fn>;
declare const r: R;
const head = r.at(0);
const idx = r.findIndex(n => n > 0);
export { head, idx };
