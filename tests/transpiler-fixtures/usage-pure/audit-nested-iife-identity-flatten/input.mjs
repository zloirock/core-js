// an identity IIFE (`(g => g)(globalThis)`) is wholly discardable - the lifted argument is
// the receiver, the call evaluation is pure - so the declarator flattens to the binding
const { Array: { from } } = (g => g)(globalThis);
from([1]);
