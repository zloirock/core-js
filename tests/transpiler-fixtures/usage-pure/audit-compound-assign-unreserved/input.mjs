// compound assignment `_ref += 10` writes to `_ref` - it must register as a user-owned
// binding so plugin-generated refs (for memoization of receivers / synth-swap rewrites)
// avoid colliding with it. without this, the plugin could pick `_ref` for its own use
// and the subsequent user read / write would clobber the wrong value
globalThis._ref = 1;
_ref += 10;
console.log(_ref);
[1, 2, 3].at(0);
