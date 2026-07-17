let M;
if (globalThis.cond) ({
  Map: M
} = globalThis);
M.groupBy([1], x => x);
