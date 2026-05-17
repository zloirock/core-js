import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// arrow-with-expression-body where the body is `(assignment) as any`: the TS wrapper
// sits between the arrow body and the inner assignment. `findEnclosingIIFE` peels Paren
// AND TS wrappers on the body side (mirrors the callee-side wrapper handling) so the
// "assignment IS the body" trivial-straight-line case still matches through TS casts
let x = [1, 2, 3];
(() => (x = "hello") as any)();
_atMaybeString(x).call(x, 0);