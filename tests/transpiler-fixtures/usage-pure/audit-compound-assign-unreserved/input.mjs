// user code writes to `_ref` via compound assignment: that name is reserved for the
// user, plugin-generated temporaries must pick a different identifier so the user's
// read / write keep their original value
globalThis._ref = 1;
_ref += 10;
console.log(_ref);
[1, 2, 3].at(0);
