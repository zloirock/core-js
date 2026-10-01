import _Array$from from "@core-js/pure/actual/array/from";
// Legacy angle-bracket cast `<any>(...)` wraps a destructure-assignment cascade.
// Cascade flatten must peel TS expression wrappers so `from` resolves to the polyfill alias.
let from;
<any> ({
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
});
const arr = from([1, 2, 3]);
export { arr };