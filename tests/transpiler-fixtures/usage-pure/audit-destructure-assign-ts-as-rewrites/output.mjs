import _Array$from from "@core-js/pure/actual/array/from";
// simple destructure-assignment wrapped in TS `as any`: `({ from } = Array) as any;`.
// `canTransformDestructuring` walks from AssignmentExpression to ExpressionStatement to
// confirm the assign-expression is the whole statement. without peeling TS wrappers
// (`TSAsExpression`, `TSSatisfiesExpression`, etc.) between Assignment and ExpressionStmt
// the gate silently bails and the destructure rewrite is dropped. fixed mirror-side in
// both unplugin (`destructure-emit-utils.js`) and babel-plugin (`destructure-emitter.js`)
let from: any;
from = _Array$from;
console.log(from);