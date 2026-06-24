// A per-branch (conditional / logical) destructure receiver whose branch is a proxy-global member with a
// pure-CONSTRUCTOR leaf whole-swaps to that pure ctor, so an unpolyfilled sibling key reads off it
// (`_Map.foo`) - the same collapse-target as the nested partial-mirror, and the same in both emitters.
// every proxy navigation shape resolves to the same pure ctor: a direct member (`globalThis.Map`), a
// deeper proxy hop (`globalThis.self.Promise`), and a call-rooted IIFE (`(() => globalThis)().Promise`).
const cond = true;

const { groupBy, foo } = cond ? globalThis.Map : Object;

const { allSettled, bar } = cond ? globalThis.self.Promise : Object;

const { any, baz } = cond ? (() => globalThis)().Promise : Object;

export { groupBy, foo, allSettled, bar, any, baz };
