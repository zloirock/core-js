import _Array$from from "@core-js/pure/actual/array/from";
// the mirrored literal replaces an arrow's WHOLE expression body, which must stay
// parenthesized (block ambiguity); AST printers add the parens automatically
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