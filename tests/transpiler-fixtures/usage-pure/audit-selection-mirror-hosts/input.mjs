// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
let cond = c1;
const alt = { Array: {}, JSON: {} };
const eff = () => 1;
const fb = 9;
export const t1 = (() => { const { Array: { of }, JSON: { stringify } } = (eff(), globalThis) || alt; return [of(1), stringify(2)]; })();
export const t2 = (() => { const { Array: { from = fb } } = (eff(), globalThis) || alt; return from([3]); })();
export const t3 = (() => { let of, rest; ({ Array: { of, ...rest } } = cond && globalThis); return [of(1), rest]; })();
export const t4 = (() => { let from; ({ Array: { from = fb } } = globalThis || alt); return from([4]); })();
use(t1, t2, t3, t4);
