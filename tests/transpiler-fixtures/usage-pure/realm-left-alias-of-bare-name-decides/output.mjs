import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Set from "@core-js/pure/actual/set/constructor";
// A `||` / `??` left read through a local alias of a bare global name decides the selection as the name does -
// an engine lacking the global throws there before the right runs - even where the build serves nothing of it
// (`Promise` excluded): the selection folds to the alias and the static read through it takes its pure entry in
// one pass. An alias of a realm read the build does not serve decides nothing: both operands stay.
const AliasPromise = Promise;
export const viaAlias = _Promise$try(task);
const RealmPromise = _globalThis.Promise;
export const viaRealmAlias = (RealmPromise || _Set).withResolvers();