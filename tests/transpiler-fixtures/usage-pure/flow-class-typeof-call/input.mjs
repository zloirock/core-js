// @flow
// A call through typeof an ambient static method reads the function signature.
declare class C { static m(): number[] }
function f(m: typeof C.m) { m().at(0); }
