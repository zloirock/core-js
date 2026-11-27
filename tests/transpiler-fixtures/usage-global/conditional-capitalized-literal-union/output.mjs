import "core-js/modules/es.string.at";
// Capitalizing every member leaves exactly the two literals on the right.
type Channel = 'data' | 'error';
type Result = Capitalize<Channel> extends 'Data' | 'Error' ? string : number[];
function getFirst(value: Result) {
  return value.at(0);
}
console.log(getFirst('text'));
export {};