// a side-effect computed key whose value is a destructured GLOBAL constructor (`{ [(eff(),
// "Promise")]: P } = globalThis`): extract `const P = _Promise` (the pure ctor) and keep the
// SE-key as a `_unused` residual so the effect runs in order. `P` stays a global alias so reads
// re-polyfill (`P.allSettled`); binding the pure ctor keeps the static and `new P` on ie:11.
let log = [];
const { [(log.push(1), "Promise")]: P } = globalThis;
const settled = P.allSettled([]);
const pending = new P(resolve => resolve());
export { log, settled, pending };
