// arrow-with-expression-body where the body is `(assignment) as any`: the TS wrapper
// sits between the arrow body and the inner assignment. `findEnclosingIIFE` peels Paren
// AND TS wrappers on the body side (mirrors the callee-side wrapper handling) so the
// "assignment IS the body" trivial-straight-line case still matches through TS casts
let x = [1, 2, 3];
(() => ((x = "hello") as any))();
x.at(0);
