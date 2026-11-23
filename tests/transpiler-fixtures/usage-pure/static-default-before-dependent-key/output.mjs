import _Array$from from "@core-js/pure/actual/array/from";
export function read({
  from = arguments.length && arguments[0] !== void 0 ? void 0 : _Array$from,
  [note(typeof from)]: other
} = Array) {
  return [from, other];
}