import _AggregateError from "@core-js/pure/actual/aggregate-error/constructor";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
import _Promise from "@core-js/pure/actual/promise";
import _URL from "@core-js/pure/actual/url/constructor";
// an escaping reference answers for the value the REALM holds under that name, never for the
// spelling: a leaf resolving to a binding this file wrote hands out that binding, so the
// constructor's family is not owed and the read below keeps its own module alone. the last two
// rows are the boundary - both take their value from outside the leaf's own frame, and the family
// is owed after all, but for two different reasons, and only one of them holds on BOTH flavors. the
// PARAMETER row is owed it through the value: this file spells the only call, and that call passes
// the realm's constructor, so the minted binding is what leaves and both flavors owe the family. the
// FOR-OF row is owed it through the BINDING alone - the head takes its value from a list this file
// does not spell, so nothing bounds what it holds. that is a usage-GLOBAL debt: it patches the one
// slot every read lands on, a caller's value included. usage-pure substitutes its minted binding
// only where the realm is proven, and a value from an unspelled list is never that binding - so the
// pure entry stays the constructor's own. Read against the headline claim alone they look vacuous, which is
// why they say so here. Each boundary row needs BOTH of its uses of the name - the shadow supplies
// the stamp and the realm read supplies what the stamp widens; with the read removed nothing is
// injected at all and the row tests nothing.
// one global per row, since a name is answered once per FILE, and each is a global whose family
// is a strict superset of its constructor in both flavors
function hand(x) {
  _globalThis.taken = x;
}
{
  let Map = 1;
  hand(Map);
}
new _Map();
{
  class AggregateError {}
  hand(AggregateError);
}
new _AggregateError([]);
function shell(Promise) {
  hand(Promise);
}
shell(_Promise);
new _Promise(function (r) {
  r();
});
for (const URL of list) hand(URL);
new _URL('x');
// a callee that hands its argument straight BACK is not where a value leaves - but the CALL is then
// the value, and it leaves here, so the family is owed exactly as it is for the bare reference
const identity = x => x;
hand(identity(Number));
export const rounded = _Number$parseFloat('1.5');
export const done = true;