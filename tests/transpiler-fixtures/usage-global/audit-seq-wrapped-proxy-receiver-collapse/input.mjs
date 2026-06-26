// usage-global parity for a proxy-global receiver wrapped in a side-effecting SequenceExpression `(eff(),
// globalThis.self)`, plain and OPTIONAL. usage-global keeps the member verbatim (the prefix effect is never
// folded away) and resolves the instance polyfills THROUGH the wrapped receiver, injecting each side-effect
// import. mirrors the pure shape set: plain receiver, optional member-tail, optional identifier-tail, optional
// `.window` hop. distinct instance method per line so no two lines share a chain.
let log = [];
function eff(tag) {
  log.push(tag);
}
const nonOpt = (eff('a'), globalThis.self).Array.prototype.flat.call([1, [2]]);
const optInst = (eff('b'), globalThis.self)?.Array.prototype.includes.call([1], 1);
const optId = (eff('c'), globalThis)?.Array.prototype.at.call([3, 4], 0);
const optWin = (eff('d'), globalThis.window)?.Array.prototype.flatMap.call([1], x => [x]);
export { nonOpt, optInst, optId, optWin, log };
