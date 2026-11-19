import _Array$from from "@core-js/pure/actual/array/from";
// A quiet identity call names the same realm hop as its literal argument.
export function read() {
  const key = value => value;
  return (key("self"), _Array$from)([3]);
}