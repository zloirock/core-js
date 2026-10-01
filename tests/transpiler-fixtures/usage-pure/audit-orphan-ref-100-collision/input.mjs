// user code already declares `_ref`, `_ref2`, `_ref3`, `_ref10`-`_ref12`. when the
// plugin needs to allocate its own `_refN`, it must consult scope bindings so the new
// name doesn't collide with any user-occupied slot, including double-digit suffixes
let _ref = 0;
let _ref2 = 1;
let _ref3 = 2;
let _ref10 = 3;
let _ref11 = 4;
let _ref12 = 5;
const arr = [_ref, _ref2, _ref3, _ref10, _ref11, _ref12];
arr.at(0);
arr.findLast(x => x > 0);
