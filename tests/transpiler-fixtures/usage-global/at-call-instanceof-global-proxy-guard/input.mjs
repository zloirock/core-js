// distinct method per guard form so a silently dropped detection of any single
// alias-narrow is visible as its own missing import
function fn(x) {
  if (x instanceof globalThis.Array) x.at(0);
  if (x instanceof window.Array) x.includes(1);
  if (x instanceof self.Array) x.flat();
  if (x instanceof global.Array) x.findLast(Boolean);
}
