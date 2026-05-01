// All four TS expression wrappers nested around the receiver: TSAsExpression,
// TSSatisfiesExpression, TSNonNullExpression, TSTypeAssertion. unwrapRuntimeExpr peels
// each layer; both parsers should reach Array and Map bindings respectively
const a = ((Array as any) satisfies any).from([1]);
const b = ((<any>Map)!).groupBy([1, 2], x => x);
