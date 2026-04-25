// user's `include: ['constructor']` / `['toString']` / `['__proto__']` should not match
// anything through prototype-chain lookup on the entries map. `Object.hasOwn` guard
// prevents silent no-op masquerading as "match"
[1, 2, 3].at(0);
