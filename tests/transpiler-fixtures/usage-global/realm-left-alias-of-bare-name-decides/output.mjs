import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A `||` / `??` left read through a local alias of a bare global name decides the selection as the name does -
// an engine lacking the global throws there before the right runs - and so does an alias of a realm read of a
// global the data subset carries, excluded or not (`Promise`): the dead right injects nothing (`Iterator`, `Set`).
// An alias of a realm read of one the subset lacks at the mode decides nothing: the right keeps its modules (`Map`).
const AliasPromise = Promise;
export const viaAlias = (AliasPromise ?? Iterator).try(task);
const RealmPromise = globalThis.Promise;
export const viaRealmAlias = (RealmPromise || Set).withResolvers();
const RealmAsyncIterator = globalThis.AsyncIterator;
export const viaUncarried = (RealmAsyncIterator || Map).groupBy(list, key);