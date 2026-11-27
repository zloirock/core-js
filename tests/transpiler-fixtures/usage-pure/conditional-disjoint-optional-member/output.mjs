import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A nonempty record without a shared property does not extend this all-optional target.
type Input = {
  width: number;
};
type Bound = {
  label?: string;
};
type Value = Input extends Bound ? number[] : string;
function first(value: Value) {
  return _atMaybeString(value).call(value, 0);
}
console.log(first('xyz'));
export {};