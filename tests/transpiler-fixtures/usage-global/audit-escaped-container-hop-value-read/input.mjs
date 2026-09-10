// a VALUE read through a container hop that holds a proxy global resolves like every other
// position the same chain appears in. the escape a call argument (or a return) performs re-homes
// the slot the read LANDS on - `ns.g.Map`, not the `ns.g` it navigates through - so the receiver
// walk keeps descending the literal. the two negatives - a slot whose own value was handed out, and
// a slot this file replaced - are method-aware consults answered in usage-pure, which leaves both
// reads native; usage-global keeps resolving and over-injects for the SUBSTITUTION, while the escape
// census reads the replacement itself, so a read landing on it owes no family. each row names its
// OWN global, or one row's family would answer for another's there
const ns = { g: globalThis };
hand(ns.g.Map);
const nested = { a: { g: globalThis } };
hand(nested.a.g.Set);
const boxes = [{ g: globalThis }];
hand(boxes[0].g.WeakMap);
export function taken() {
  return ns.g.WeakSet;
}
// the escaped slot ITSELF: `handed.a.b` was passed out, so a static read through it stays raw
const handed = { a: { b: Object } };
hand(handed.a.b);
use(handed.a.b.groupBy([], item => item));
// the replaced slot: the literal no longer says what `rep.g` holds
const rep = { g: globalThis };
rep.g = { URL: null };
hand(rep.g.URL);
