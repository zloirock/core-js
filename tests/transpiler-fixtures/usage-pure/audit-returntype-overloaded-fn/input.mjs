// `ReturnType<typeof overloaded>`: TS picks the LAST overload's return signature (the
// implementation signature stays hidden from public lookups). resolveReturnTypeFromTypeQuery
// walks all sibling ambients via findAmbientFunctionPaths and selects the last match,
// matching TS semantics. here `string[]` wins -> `r.at?.(0)` narrows to the array polyfill
declare function fn(): number;
declare function fn(): string[];
type R = ReturnType<typeof fn>;
declare const r: R;
r.at?.(0);
