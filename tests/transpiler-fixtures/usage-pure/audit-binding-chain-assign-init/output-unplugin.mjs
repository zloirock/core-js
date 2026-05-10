import _Array$from from "@core-js/pure/actual/array/from";
// chain-assign in const-binding init: `const X = (a = Array)` evaluates to Array at
// runtime, then `X.from(...)` calls Array.from. binding-init walk must peel the
// AssignmentExpression rhs to recover the Array constructor for static dispatch
const X = (a = Array);
_Array$from([]);