import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.aggregate-error.cause";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.reject";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.promise.race";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.epsilon";
import "core-js/modules/es.number.is-finite";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.number.is-nan";
import "core-js/modules/es.number.is-safe-integer";
import "core-js/modules/es.number.max-safe-integer";
import "core-js/modules/es.number.min-safe-integer";
import "core-js/modules/es.number.parse-float";
import "core-js/modules/es.number.parse-int";
import "core-js/modules/es.number.to-exponential";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.promise.all-keyed";
import "core-js/modules/esnext.promise.all-settled-keyed";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.url.constructor";
import "core-js/modules/web.url.can-parse";
import "core-js/modules/web.url.parse";
import "core-js/modules/web.url.to-json";
import "core-js/modules/web.url-search-params.constructor";
import "core-js/modules/web.url-search-params.delete";
import "core-js/modules/web.url-search-params.has";
import "core-js/modules/web.url-search-params.size";
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
  globalThis.taken = x;
}
{
  let Map = 1;
  hand(Map);
}
new Map();
{
  class AggregateError {}
  hand(AggregateError);
}
new AggregateError([]);
function shell(Promise) {
  hand(Promise);
}
shell(globalThis.Promise);
new Promise(function (r) {
  r();
});
for (const URL of list) hand(URL);
new URL('x');
// a callee that hands its argument straight BACK is not where a value leaves - but the CALL is then
// the value, and it leaves here, so the family is owed exactly as it is for the bare reference
const identity = x => x;
hand(identity(Number));
export const rounded = Number.parseFloat('1.5');
export const done = true;