// `...xs: T[]` stores `T[]` on RestElement.typeAnnotation; tuple element is T, so inner
// must be unwrapped one level to propagate the element type to chained ops
function fn(...xs: string[]) { return xs; }
declare const args: Parameters<typeof fn>;
args.at(0)?.at(-1);
