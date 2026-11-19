// A native nested sibling reads before the following methods, once each, in a bodyless var host.
// Capture the level that owns the methods instead of descending into the native sibling.
// The remaining sidecar only moves an uninitialized guard var to its enclosing scope.
if (a) var { y: { other: { q }, at, includes } } = { y: box.y }, x1 = 1;
while (b) var { y: { more: { r }, flat, fill, find } } = { y: box.z }, x2 = 2;
for (;;) var { y: { last: { t }, findLast = null, keys } } = { y: box.w }, x3 = 3;
use(q, at, includes, x1, r, flat, fill, find, x2, t, findLast, keys, x3);
