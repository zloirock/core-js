import _Array$from from "@core-js/pure/actual/array/from";
// stacked Paren + TS wrappers: `((({from} = Array) as any) satisfies unknown)!;`. shared
// peeler iterates through every wrapper level (TSAsExpression, TSSatisfiesExpression,
// TSNonNullExpression, ParenthesizedExpression in any order) until ExpressionStatement
// is reached. asserts the peeler doesn't bail at the first wrapper boundary
let from: any;
from = _Array$from;
console.log(from);