// `'key' in (assign-or-SE)` rewrites the whole BinaryExpression to a leading-`(` replacement
// `(rhs, true)`. At a statement-leading slot after an unterminated line, ASI fuses the previous
// expression into the new `(...)` as a call (`a = 1\n(a = Array, true)` parses as `a = 1(...)`).
// a leading `;` must be injected to keep the rewrite as its own statement.
let a;
a = 1
'from' in (a = Array);
