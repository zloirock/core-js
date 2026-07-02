// `const f = getArr` aliases an ambient `declare function getArr(): string[]`. probing the
// ambient return by the user-facing callee name `f` misses (no ambient `f`), so the call
// must retry the ambient lookup against the walked-through Identifier `getArr`. without the
// retry `f().at(0)` falls back to generic `_at` instead of narrowing to `_atMaybeArray`
declare function getArr(): string[];
const f = getArr;
f().at(0);
