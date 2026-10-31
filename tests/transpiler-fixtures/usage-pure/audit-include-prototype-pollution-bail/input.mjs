// user's `include: ['constructor']` / `['toString']` / `['__proto__']` should not match
// anything through prototype-chain lookup on the entries map: an `Object.hasOwn` guard keeps
// them from reading as entries, and as module patterns they match no module, so validation
// reports them as unmatched instead of a silent no-op masquerading as "match"
[1, 2, 3].at(0);
