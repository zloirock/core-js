import _Array$from from "@core-js/pure/actual/array/from";
// single-decl proxy flatten - no sibling, no instance method anywhere. asserts the
// minimal flatten case still works as a control variant
const {
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
};
export { from };