// indirect-binding path: `k = Symbol.iterator`, then `k in Array`. handleBinaryIn
// branch 2 (resolvedLeft) emits `{kind: 'in', key: 'Symbol.iterator', ...}` without
// seeding handledObjects for Symbol on the RHS - but here Symbol appears in `k`'s init
// only, so identifier visitor sees it once at init, not at the `in` site
const k = Symbol.iterator;
k in Array;
