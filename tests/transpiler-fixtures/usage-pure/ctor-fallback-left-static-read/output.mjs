import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Reflect$apply from "@core-js/pure/actual/reflect/apply";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
import _URL from "@core-js/pure/actual/url";
import _URL$canParse from "@core-js/pure/actual/url/can-parse";
import _URL$parse from "@core-js/pure/actual/url/parse";
// A static read off a `||` / `??` whose constructor LEFT always decides is that left's own static: the
// right never runs, so the receiver keeps only the left's effects - none for a call proven effect-free,
// and nothing of a write or a call in the right. A left that may be falsy keeps the selection as
// written; an `&&` over a served left yields its right, whose own static it reads, and a stored left
// keeps its write and reads off it, the dead right folded away.
function make() {
  log();
  return _URL;
}
const realm = () => _Map;
let n = 0;
let stored;
let unrun;
const maybe = pick();
export const viaOr = _Iterator$concat;
export const viaNullishCall = _Symbol$for('key');
export const viaSequence = (n++, _Reflect$ownKeys);
export const viaCall = (make(), _URL$canParse);
export const viaQuietCall = _Map$groupBy;
export const dropsRightWrite = _Reflect$apply;
export const dropsRightCall = _Promise$try;
export const keepsUnknownLeft = (maybe || _Iterator).from;
export const keepsStoredLeft = (stored = _URL, _URL$parse);
export const andYieldsRight = _Promise$allSettled;
export { n, unrun };