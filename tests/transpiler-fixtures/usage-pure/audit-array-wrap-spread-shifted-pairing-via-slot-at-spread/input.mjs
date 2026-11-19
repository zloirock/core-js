// A spread can occupy the constructor's runtime position with any element.
// The resulting WeakMap binding and construction retain their native values.
let tail = [{}, {}];
// The assignment twin retains its spread-shifted runtime constructor value.
let ax, AM, AS;
([ax, { Promise: AM }] = [...tail, globalThis]);
// A spread after the first element preserves that position; its own elements remain uncertain.
const [{ Set: C }, { WeakMap: W }] = [globalThis, ...tail];
export const viaSlotAtSpread = new W();
