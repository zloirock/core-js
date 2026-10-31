import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// A `||` / `??` left read through a local alias of a bare global name decides the selection as the name does -
// an engine lacking the global throws there before the right runs - and so does an alias of a realm read of a
// global the data subset carries, excluded or not (`Promise`): the dead right leaves with its import, and the
// static read through either takes its pure entry. An alias of a realm read of one the subset lacks at the mode
// decides nothing: both operands stay.
const AliasPromise = Promise;
export const viaAlias = _Promise$try(task);
const RealmPromise = _globalThis.Promise;
export const viaRealmAlias = _Promise$withResolvers();
const RealmAsyncIterator = _globalThis.AsyncIterator;
export const viaUncarried = (RealmAsyncIterator || _Map).groupBy(list, key);