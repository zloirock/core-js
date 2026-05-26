// Web-legacy sloppy `if (cond) function f() {...}` form: function declaration
// in a single-statement IfStatement consequent slot. confirms inner static
// method usage still picks up its polyfill - the bodyless-slot host wrapper
// must lift the declaration into a block when destructure-emitter touches it.
if (true) function f() { Array.from([1, 2]); }
f();
