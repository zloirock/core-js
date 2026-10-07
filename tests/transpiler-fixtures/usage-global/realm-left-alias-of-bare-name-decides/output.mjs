import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
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
import "core-js/modules/web.dom-collections.iterator";
// A `||` / `??` left read through a local alias of a bare global name decides the selection as the name does -
// an engine lacking the global throws there before the right runs - even where the build serves nothing of it
// (`Promise` excluded): the dead right's constructor injects nothing (`Iterator`). An alias of a realm read the
// build does not serve decides nothing: the right keeps its modules (`Set`).
const AliasPromise = Promise;
export const viaAlias = (AliasPromise ?? Iterator).try(task);
const RealmPromise = globalThis.Promise;
export const viaRealmAlias = (RealmPromise || Set).withResolvers();