import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-exception.constructor";
import "core-js/modules/web.dom-exception.stack";
import "core-js/modules/web.dom-exception.to-string-tag";
import "core-js/modules/web.dom-collections.iterator";
// A spread BEFORE an array-wrap slot shifts every later runtime position, so the pattern slot no longer pairs EXACTLY with the
// literal init element at the same index - but every static element from the spread on is still a POSSIBLE slot value, and
// inject-if-might is sound here: a member read off the alias injects the union's method-aware set as a MAYBE.
let tail = globalThis.tail;
// control: a spread strictly AFTER the slot keeps earlier positions static - the sound slot
// resolves and its constructor modules inject; the sibling slot AT the spread stays unresolvable
const [{
  Set: C
}, {
  WeakMap: W
}] = [globalThis, ...tail];
export const viaSpreadAfter = new C(afterSeed);
let AB;
[, {
  DOMException: AB
}] = [...tail, globalThis];