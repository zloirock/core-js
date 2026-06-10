import _Array$from from "@core-js/pure/actual/array/from";
// an identity IIFE (`(g => g)(globalThis)`) is wholly discardable - the lifted argument is
// the receiver, the call evaluation is pure - so the declarator flattens to the binding
const from = _Array$from;
from([1]);