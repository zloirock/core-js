import _Array$from from "@core-js/pure/actual/array/from";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
declare const log: () => void;
const userGlobal = {
  Array
};
for (const from = (log(), _Array$from), {
    Array: _unused,
    ...rest
  } = userGlobal; false;) {
  console.log(from, rest);
}