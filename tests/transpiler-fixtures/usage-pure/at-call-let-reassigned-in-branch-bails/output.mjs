import _at from "@core-js/pure/actual/instance/at";
let x = [1, 2, 3];
if (cond) x = "hello";
_at(x).call(x, -1);