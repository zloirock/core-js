// A static read off a `||` / `??` whose constructor LEFT always decides is that left's own static: the
// right never runs, so the receiver keeps only the left's effects - none for a call proven effect-free,
// and nothing of a write or a call in the right. A left that may be falsy keeps the selection as
// written; an `&&` over a served left yields its right, whose own static it reads, and a stored left
// keeps its write and reads off it, the dead right folded away.
function make() { log(); return URL; }
const realm = () => Map;
let n = 0;
let stored;
let unrun;
const maybe = pick();
export const viaOr = (Iterator || Set).concat;
export const viaNullishCall = (Symbol ?? WeakSet).for('key');
export const viaSequence = ((n++, Reflect) || WeakMap).ownKeys;
export const viaCall = (make() || DOMException).canParse;
export const viaQuietCall = (realm() || queueMicrotask).groupBy;
export const dropsRightWrite = (Reflect || (unrun = DisposableStack)).apply;
export const dropsRightCall = (Promise ?? make()).try;
export const keepsUnknownLeft = (maybe || Iterator).from;
export const keepsStoredLeft = ((stored = URL) || AsyncDisposableStack).parse;
export const andYieldsRight = (Symbol && Promise).allSettled;
export { n, unrun };
