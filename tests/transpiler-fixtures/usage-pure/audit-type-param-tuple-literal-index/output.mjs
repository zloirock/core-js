import _at from "@core-js/pure/actual/instance/at";
// generic `<T extends [any, any]>(t: T): T[0]` with arg `[string[], number]` - numeric-literal
// indexed access on the type parameter should pick up the concrete first element
function first<T extends [unknown, unknown]>(t: T): T[0] {
  return t[0] as T[0];
}
const xs = first([['hi'], 1] as [string[], number]);
_at(xs).call(xs, 0);