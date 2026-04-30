// Extract<T, string[]> with T being a generic type-param resolved through call site.
// resolveExtractExclude line 1452: followTypeAliasChain(unwrapped) — when first is T (a type-param),
// followTypeAliasChain returns null (T is not in scope as alias). The function continues with the original
// unwrapped which is just T, then types becomes [T] (single member).
// The substitute path uses the typeParamMap, so resolveAnnotationInContext should resolve T to its bound type.
type Extracted<T> = Extract<T, string[]>;
declare function probe<T>(arg: T): Extracted<T>;
const r = probe<string[]>(null!);
r.at(0);
