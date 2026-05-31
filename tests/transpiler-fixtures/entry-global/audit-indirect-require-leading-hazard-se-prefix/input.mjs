// indirect-require SE prefix whose leading element is an ObjectExpression: emitted verbatim at
// statement position it would parse as a BLOCK (`{a: spy()};`), losing the object semantics. the
// emit must parenthesize expression-statement hazards (`{` / `function` / `class`) so it stays an
// ExpressionStatement - babel's t.expressionStatement does this implicitly.
function spy() { return 1; }
({ a: spy() }, require)("core-js/actual/array/from");
