// A realm element retains each nested prototype receiver through an assignment head.
let at, includes;
for ({ Array: { prototype: { at, includes } } } of [globalThis]) use(at, includes);
