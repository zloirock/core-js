import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// passthrough recognition for `{[K in keyof T]: (T[K])}`: oxc preserves the paren as a
// TSParenthesizedType on `node.typeAnnotation`, babel parser drops it. without peeling that
// paren the oxc path misses the cheap passthrough and walks per-key instead (equivalent but
// slower). validates both parsers reach the same narrow through the paren-wrapped passthrough
type Container<T> = { [K in keyof T]: (T[K]) };
type Items = Container<{
  items: number[];
}>['items'];
const x: Items = [];
_atMaybeArray(x).call(x, -1);