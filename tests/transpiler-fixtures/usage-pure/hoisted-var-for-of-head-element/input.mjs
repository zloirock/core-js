// a `var` bound by a for-of head is the element on every pass and after the loop, even where it
// hoists out of a nested block: a static read off it is guarded on that element in pure and injected
// in usage-global, the same on both parsers
for (var M of [Map]) {}
M.groupBy(src, fn);
function inner() {
  if (flag) {
    for (var P of [Promise]) {}
  }
  return P.try(fn);
}
