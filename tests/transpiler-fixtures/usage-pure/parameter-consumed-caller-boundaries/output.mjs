import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// Observable arguments and unknown callees keep their original receivers.
// Export, escape, reassignment, rest and spread prevent caller-only extraction.
function observed([{
  from
} = {
  from: _Array$from
}]) {
  return [arguments[0], from];
}
function referenced({
  of
} = {
  of: _Array$of
}) {
  const original = arguments;
  return [original, of];
}
export function exported([{
  isArray
} = Array]) {
  return isArray;
}
function escaped([{
  from
} = {
  from: _Array$from
}]) {
  return from;
}
const held = {
  escaped
};
let reassigned = ([{
  of
} = {
  of: _Array$of
}]) => of;
function rest(...[{
  from
} = {
  from: _Array$from
}]) {
  return from;
}
function spread([{
  of
} = {
  of: _Array$of
}]) {
  return of;
}
function invoke(args) {
  return spread(...args);
}
observed([Array]);
referenced(Array);
exported([Array]);
held.escaped([Array]);
reassigned = value => value;
reassigned([Array]);
rest(Array);
invoke([[Array]]);