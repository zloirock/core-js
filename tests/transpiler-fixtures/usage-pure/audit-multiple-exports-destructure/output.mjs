import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// Two polyfillable destructurings separated by a plain one: tests interleaving
// in applyDestructuringTransforms (polyfilledByDecl map + source-order emission).
// each destructuring stays independent because groupBy declPath uses VariableDeclaration
// identity, but these are separate declarations.
const from = _Array$from;
const plain = 1;
const of = _Array$of;
plain;