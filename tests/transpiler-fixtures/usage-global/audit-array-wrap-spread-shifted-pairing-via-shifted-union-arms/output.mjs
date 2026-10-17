import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-exception.constructor";
import "core-js/modules/web.dom-exception.stack";
import "core-js/modules/web.dom-exception.to-string-tag";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// A spread BEFORE an array-wrap slot shifts every later runtime position, so the pattern slot no longer pairs EXACTLY with the
// literal init element at the same index - but every static element from the spread on is still a POSSIBLE slot value, and
// inject-if-might is sound here: a member read off the alias injects the union's method-aware set as a MAYBE.
let tail = globalThis.tail;
// a UNION candidate contributes each arm: an all-proxy ternary or `||` collapses to the one
// canonical global; a diverging union still injects by its resolving arm (inject-if-might);
// an `&&` guard stays whole - its falsy LEFT is the expression's value, never collapsible
const [u1, {
  Reflect: RA
}] = [...tail, pick ? globalThis : self];
export const viaShiftedUnionArms = RA.ownKeys({});
let AB;
[, {
  DOMException: AB
}] = [...tail, globalThis];