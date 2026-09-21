import _Promise from "@core-js/pure/actual/promise";
// Selection through a nested container still owes only the named Promise static in global.
const source = {
  values: [_Promise]
};
export function read(key) {
  return source.values[key].withResolvers();
}