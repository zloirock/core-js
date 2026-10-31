// a for-x HEAD binds an ELEMENT of what the loop iterates, which no init can spell. A literal whose
// elements agree names one value to every read through the binding, so a member read resolves exactly
// as the same literal under a plain `const` does: an array slot takes the type-specific dispatch, a
// function slot takes none. A SOLE element agrees by construction; a longer one answers where its own
// common type resolves. The negatives: a NAMED element is reached through its own declaration instead,
// and a longer literal whose elements DISAGREE is two values, so both keep the generic read.
// one method per row: two rows sharing one would mask each other's dispatch
for (const el of [{ w() { return 1; }, y: [1, 2] }]) el.y.at(0);
for (const fn of [{ w() { return 1; } }]) fn.w.flat();
for (const named of [box]) named.y.includes(1);
for (const agree of [{ y: [1, 2] }, { y: [3, 4] }]) agree.y.keys();
for (const disagree of [{ y: [1, 2] }, { y: 'str' }]) disagree.y.entries();
