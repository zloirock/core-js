// a side-effect computed key whose value is a destructured GLOBAL constructor (`{ [(eff(), "Promise")]:
// P } = globalThis`): both emitters extract `const P = _Promise` (the pure ctor) and keep the SE-key as a
// `_unused` residual so the effect still runs in source order. the local is registered as a global alias
// so member reads re-polyfill (`P.allSettled` -> the pure static) - registering it ALSO as a body-extract
// alias would clobber that and leave the read raw against the bare ctor (which lacks the static) -> a
// TypeError on ie:11. binding the pure ctor (not the native global) also keeps `new P` working on ie:11
let log = [];
const { [(log.push(1), "Promise")]: P } = globalThis;
const settled = P.allSettled([]);
const pending = new P(resolve => resolve());
export { log, settled, pending };
