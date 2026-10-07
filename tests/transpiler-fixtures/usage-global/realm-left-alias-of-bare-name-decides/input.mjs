// A `||` / `??` left read through a local alias of a bare global name decides the selection as the name does -
// an engine lacking the global throws there before the right runs - even where the build serves nothing of it
// (`Promise` excluded): the dead right's constructor injects nothing (`Iterator`). An alias of a realm read the
// build does not serve decides nothing: the right keeps its modules (`Set`).
const AliasPromise = Promise;
export const viaAlias = (AliasPromise ?? Iterator).try(task);
const RealmPromise = globalThis.Promise;
export const viaRealmAlias = (RealmPromise || Set).withResolvers();
