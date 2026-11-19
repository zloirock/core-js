// a leading `this` pseudo-param fills an AST param slot but no runtime arg slot: overload
// arity and per-slot pairing must align with the CALL args, so a this-annotated overload
// arg-matches like its unannotated twin instead of being skipped or mismatched
declare function g(this: Window, x: string): number[];
declare function g(x: number): string;