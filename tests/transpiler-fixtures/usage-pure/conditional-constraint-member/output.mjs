import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// The number element fails the constraint on the inferred string, selecting the array member.
type Outcome<T> = T extends Array<infer V extends string> ? {
  data: string;
} : {
  data: number[];
};
function read(value: Outcome<number[]>) {
  var _ref;
  return _atMaybeArray(_ref = value.data).call(_ref, 0);
}
export const result = read({
  data: [42]
});