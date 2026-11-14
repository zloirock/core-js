import _Array$from from "@core-js/pure/actual/array/from";
// An optional environment probe keeps the nullable realm and its static read.
export function read() {
  return null == (typeof window !== "undefined" ? window : undefined) ? void 0 : _Array$from([3]);
}