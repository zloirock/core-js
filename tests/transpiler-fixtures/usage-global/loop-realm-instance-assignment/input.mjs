// A relocated assignment head mirrors the realm hop before dispatching
// its nested prototype leaf, without changing the receiver used by the body.
let at, from;
for ({ globalThis: { Array: { prototype: { at }, from } } } of [globalThis]) use(at, from);
