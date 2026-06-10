import _Array$from from "@core-js/pure/actual/array/from";
// a ternary param default over proxy aliases unfolds BOTH branches into mirrored literals -
// the runtime test stays native and the polyfill binds on either selection
let c = true;
function f({
  Array: {
    from
  }
} = c ? {
  Array: {
    from: _Array$from
  }
} : {
  Array: {
    from: _Array$from
  }
}) {
  return from;
}
export { f };