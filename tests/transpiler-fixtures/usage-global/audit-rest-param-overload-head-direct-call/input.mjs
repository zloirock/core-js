// a direct call takes the IMPLEMENTATION signature, so `f()` is an array and only the array family
// may be injected. Both heads answer `string`, which is what makes that visible: picking either
// head, or widening over them, would put the string family in instead. The rest params are what put
// the heads in the scope-less position that used to be rewritten into a body-bearing declaration,
// and that rewrite is exactly how the widened answer used to happen. Note the model: TypeScript
// itself resolves this call against the first matching head, not against the implementation.
function f(...a: number[]): string;
function f(...a: string[]): string;
function f(...a: any[]): number[] { return [1]; }
f().at(0);
