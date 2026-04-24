// `_ref` is read as an undeclared global (set on globalThis). plugin's ref allocator
// must account for such sloppy globals so its generated ref names don't collide - the
// user's global write must be treated as a reservation even though there's no local
// `_ref` binding declaration
globalThis._ref = { x: 5 };
console.log(_ref.x);
[1, 2, 3].at(0);
