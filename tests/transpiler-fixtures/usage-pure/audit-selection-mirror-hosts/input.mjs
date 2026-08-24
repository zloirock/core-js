// selection receivers the fromFallback dispatch cannot flag (a non-nullish PRIMARY resolves
// without it): the mirror walks EVERY hop prop (a half-registered two-hop plan emits
// nothing), a defaulted leaf mirrors like its undefaulted twin, an `&&`-declined rest
// shape takes the INSERTED sound default, and a static defaulted sole leaf over a
// discardable receiver extracts as the overwrite
let cond = c1;
const alt = { Array: {}, JSON: {} };
const eff = () => 1;
const fb = 9;
export const t1 = (() => { const { Array: { of }, JSON: { stringify } } = (eff(), globalThis) || alt; return [of(1), stringify(2)]; })();
export const t2 = (() => { const { Array: { from = fb } } = (eff(), globalThis) || alt; return from([3]); })();
export const t3 = (() => { let of, rest; ({ Array: { of, ...rest } } = cond && globalThis); return [of(1), rest]; })();
export const t4 = (() => { let from; ({ Array: { from = fb } } = globalThis || alt); return from([4]); })();
use(t1, t2, t3, t4);
