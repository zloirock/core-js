import _Array$from from "@core-js/pure/actual/array/from";
// the mirrored literal replaces an arrow's WHOLE expression body: the text emission must
// wrap it in parens (block ambiguity); AST printers add them automatically
function f({
  Array: {
    from
  }
} = (() => ({
  Array: {
    from: _Array$from
  }
}))()) {
  return from;
}
export { f };