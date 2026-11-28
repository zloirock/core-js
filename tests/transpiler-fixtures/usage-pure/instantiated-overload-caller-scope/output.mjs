import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type Value = number[];
namespace Model {
  type Value = string;
  export function make<T>(v: T): T {
    return v;
  }
}
type Result = ReturnType<typeof Model.make<Value>>;
function read(x: Result) {
  return _atMaybeArray(x).call(x, 0);
}
export const result = read([42]);