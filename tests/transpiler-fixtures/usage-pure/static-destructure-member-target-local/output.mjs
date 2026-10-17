import _Array$from from "@core-js/pure/actual/array/from";
// A member target rooted in a local object receives the extracted static.
const holder = {};
holder.from = _Array$from;
export { holder };