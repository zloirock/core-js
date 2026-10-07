// A pattern whose outer value no literal spells - a catch parameter, a for-in head - reads its inner default
// through the usage-global union alone, and a selection the build decides hands that union its live operand:
// the left's static keeps its module (`Array.from`, `Map.groupBy`, `Promise.try`, `Object.fromEntries`), the
// dead right's does not (no `Iterator.from`, no `Object.groupBy`).
try { throw {}; } catch ({ inner: { from } = Array || Iterator }) { use(from); }
try { throw {}; } catch ({ a: { b: { groupBy } = Map || Object } = {} }) { use(groupBy); }
try { throw {}; } catch ({ p: { try: attempt } = globalThis.Promise ?? Set }) { use(attempt); }
for (const { inner: { fromEntries } = Object || Map } in { k: 1 }) use(fromEntries);
