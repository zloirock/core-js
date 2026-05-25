import _Array$from from "@core-js/pure/actual/array/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// All four TS expression wrappers nested around the receiver: TSAsExpression,
// TSSatisfiesExpression, TSNonNullExpression, TSTypeAssertion. runtime-transparent peel
// strips each layer; both parsers should reach Array and Map bindings respectively
const a = _Array$from([1]);
const b = _Map$groupBy([1, 2], x => x);