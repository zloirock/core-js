import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _URL$canParse from "@core-js/pure/actual/url/can-parse";
// an array level holding a selection the build decides is the array it always yields, so the element
// pattern mirrors like that array spelled alone: declared, assigned, a parameter default, a for-of head
// and a nested level
export const [{
  groupBy
}] = [{
  groupBy: _Map$groupBy
}];
let withResolvers;
[{
  withResolvers
}] = [{
  withResolvers: _Promise$withResolvers
}];
export { withResolvers };
export function viaParam([{
  fromAsync
}] = [{
  fromAsync: _Array$fromAsync
}]) {
  return fromAsync;
}
for (const [{
  from
}] of [[{
  from: _Iterator$from
}]]) console.log(from);
export const [[{
  canParse
}]] = [[{
  canParse: _URL$canParse
}]];