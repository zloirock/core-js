// A `delete` past a static the constructor does not carry, behind the environment probe's `?.`, hides
// nothing from usage detection: each constructor the chain reads on the way pulls its module, through
// an alias of the realm and through `self` alike, past a `!` and past a paren seal.
const realm = globalThis;
export const viaRoot = delete globalThis.window?.Promise.noSuchStatic.slot;
export const viaAlias = delete realm.window?.WeakMap.noSuchStatic?.slot;
export const viaSelf = delete self.window?.Map.noSuchStatic!.slot;
export const sealed = delete (globalThis.window?.Set.noSuchStatic).slot;
