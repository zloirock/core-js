import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// a structural object-literal thenable (`{ then(cb: (v: T) => any): void }`) is unwrapped by `await`
// like the interface form: `await t` resolves to `string[]` via the then-callback's first arg, so `.at`
// narrows to the array variant. the receiver type is not a nominal Object, so the peel runs in the
// null-type await fallback
type Th = { then(cb: (v: string[]) => any): void };
declare const t: Th;
async function go() { const arr = await t; _atMaybeArray(arr).call(arr, 0); }