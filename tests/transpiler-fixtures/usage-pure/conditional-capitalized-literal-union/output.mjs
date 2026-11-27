import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Capitalizing every member leaves exactly the two literals on the right.
type Channel = 'data' | 'error';
type Result = Capitalize<Channel> extends 'Data' | 'Error' ? string : number[];
function getFirst(value: Result) {
  return _atMaybeString(value).call(value, 0);
}
console.log(getFirst('text'));
export {};