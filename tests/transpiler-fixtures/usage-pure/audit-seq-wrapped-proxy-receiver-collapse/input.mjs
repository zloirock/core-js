// A proxy-global receiver wrapped in a side-effecting SequenceExpression: `(eff(), globalThis.self)`. the
// redundant `.self` proxy hop collapses to the pure root and the prefix effect harvests ahead of it, both in a
// plain receiver `(eff(), globalThis.self).Array.prototype...` and in an OPTIONAL one `(eff(), globalThis.self)?.
// Array.prototype...`. both emitters collapse identically to `(eff(), _globalThis).Array.prototype` - no raw
// `.self` hop and no bare `globalThis` (ie:11 ReferenceError) survives on either side, so there is no sidecar.
// identifier-tail and `.window` hop cover the root variants; distinct instance method per line.
let log = [];
function eff(tag) {
  log.push(tag);
}
const nonOpt = (eff('a'), globalThis.self).Array.prototype.flat.call([1, [2]]);
const optInst = (eff('b'), globalThis.self)?.Array.prototype.includes.call([1], 1);
const optId = (eff('c'), globalThis)?.Array.prototype.at.call([3, 4], 0);
const optWin = (eff('d'), globalThis.window)?.Array.prototype.flatMap.call([1], x => [x]);
export { nonOpt, optInst, optId, optWin, log };
