// unlabeled `break` inside a switch is switch-local, not a function-level exit. the exit
// scan tracks whether descent is inside a loop/switch boundary and suppresses unlabeled
// break/continue under that flag, so the preceding switch doesn't over-bail the
// straight-line `x = "hello"` that follows it inside the IIFE body
let x = [1, 2, 3];
let k = 1;
(() => { switch (k) { case 1: break; } x = "hello"; })();
x.at(0);
