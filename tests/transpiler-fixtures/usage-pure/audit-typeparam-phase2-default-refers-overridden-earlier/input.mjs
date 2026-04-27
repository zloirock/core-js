// phase 2 default fallback in `buildTypeParamMap` must thread the accumulated typeParamMap
// through `substituteTypeParams`, not bare `resolveTypeAnnotation`. when a later type param's
// default references an earlier param (`<T = string, U = T>`) and the caller overrides T,
// U must resolve to the user-supplied T, not the declared T.default. without the fix U bound
// to T's declared default (string) -> emits `_atMaybeString` instead of `_atMaybeArray`
function f<T = string, U = T>(t: T): U {
  return t as unknown as U;
}
const result = f<number[]>([1, 2, 3]);
result.at(-1);
