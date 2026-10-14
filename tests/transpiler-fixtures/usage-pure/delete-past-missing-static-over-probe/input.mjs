// A `delete` past a static the constructor does not carry, behind the environment probe's `?.`: the
// probe decides whether the operator acts at all, so the whole delete rides its guard - an absent
// `window` answers `true`, a present one reads the missing static plainly and throws as the source
// does, past a `!` too. A paren ends the chain first, and the read past it throws on the short-circuit.
const realm = globalThis;
export const viaRoot = delete globalThis.window?.Promise.noSuchStatic.slot;
export const viaAlias = delete realm.window?.WeakMap.noSuchStatic?.slot;
export const viaSelf = delete self.window?.Map.noSuchStatic!.slot;
export const sealed = delete (globalThis.window?.Set.noSuchStatic).slot;
