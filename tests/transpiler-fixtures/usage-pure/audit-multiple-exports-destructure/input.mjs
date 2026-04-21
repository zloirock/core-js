// Two polyfillable destructurings separated by a plain one: tests interleaving
// in applyDestructuringTransforms (polyfilledByDecl map + source-order emission).
// each destructuring stays independent because groupBy declPath uses VariableDeclaration
// identity, but these are separate declarations.
const { from } = Array;
const plain = 1;
const { of } = Array;
plain;
