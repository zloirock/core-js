// `resolveCallReturnTypeFromAnnotation` TSTypeQuery branch: a binding typed as
// `typeof other` must follow the type query to the referenced function's return.
// Here `make` is annotated `() => string[]` indirectly via typeof; result.at(0) should
// narrow to array.
declare function helper(): string[];
declare const make: typeof helper;
const arr = make();
arr.at(0);
arr.findLast(x => x);
