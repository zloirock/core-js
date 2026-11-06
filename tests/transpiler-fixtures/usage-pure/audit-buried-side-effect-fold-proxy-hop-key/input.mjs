// Effectful realm keys stay in their source reads; quiet constant keys still collapse.
let log = [];
function eff(tag) { log.push(tag); return 'se'; }
const g = globalThis;
const bareConcat = globalThis[(eff('a'), 'se') + 'lf'].Array.isArray([1]);
const aliasTemplate = g[`s${ (eff('b'), 'e') }lf`].Math.max(1, 2);
const directSe = globalThis[(eff('c'), 'self')].Array.from([3]);
const noSe = globalThis['se' + 'lf'].Array.of(4);
export { bareConcat, aliasTemplate, directSe, noSe, log };
