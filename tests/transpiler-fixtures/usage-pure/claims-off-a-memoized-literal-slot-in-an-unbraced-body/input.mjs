// Several claims beside a nested pattern, in an object literal whose slot is memoized, as the first of the
// declarators an unbraced body holds: the memo leads the declaration as a declarator of its own, and each
// claim binds right after the residual, in the order the source wrote them - two under an `if`, three under
// a `while`, a defaulted one among two under a `for`. Unplugin's drains bind them ahead of it (the sidecar).
if (a) var { y: { other: { q }, at, includes } } = { y: box.y }, x1 = 1;
while (b) var { y: { more: { r }, flat, fill, find } } = { y: box.z }, x2 = 2;
for (;;) var { y: { last: { t }, findLast = null, keys } } = { y: box.w }, x3 = 3;
use(q, at, includes, x1, r, flat, fill, find, x2, t, findLast, keys, x3);
