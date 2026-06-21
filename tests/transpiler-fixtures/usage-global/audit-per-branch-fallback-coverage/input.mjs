// usage-global per-branch fallback dispatch: ternary / logical-or in destructure-receiver
// position. each branch's deps emit independently regardless of which branch is primary;
// body stays unchanged, only file-level imports differ from the no-fallback case.
// declaration init: ternary, both viable
const { from: a1 } = cond ? Array : Iterator;
// declaration init: ||, mixed (Array.from yes, userObj unknown - userObj contributes nothing)
const { from: a2 } = userObj || Array;
// declaration init: ??, member-call left contributes nothing, Iterator.from viable
const { from: a3 } = pickConstructor() ?? Iterator;
// assignment expression: ternary, multi-key destructure - both keys emit per branch
let b1, b2;
({ from: b1, of: b2 } = cond ? Array : Iterator);
// default-value param (function param default): && reversed
function f({ from } = Array && Iterator) { return from; }
export { a1, a2, a3, b1, b2, f };
