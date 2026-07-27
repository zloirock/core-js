import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
// the union arm behind a DEFERRED read is resolved through the full type machinery, not a literal
// match: a member read, a call return and a constructed instance each name their family, and the
// receiver narrows to it. the shapes matter because they all need the scope chain to resolve, which
// is the axis where the two parsers disagreed - a locked narrow here is also the emitters agreeing.
// a user class carries no polyfilled member at all, so its row asserts an EMPTY set. distinct method
// per line so each row is attributable
class Plain {}
const holder = {
  rows: [1]
};
function makeString() {
  return "ab";
}
let fromMember = null;
const readMember = () => fromMember.at(0);
fromMember = holder.rows;
export const a = readMember();
let fromCall = null;
const readCall = () => fromCall.includes(1);
fromCall = makeString();
export const b = readCall();
let fromInstance = null;
const readInstance = () => fromInstance.flatMap(f);
fromInstance = new Plain();
export const c = readInstance();