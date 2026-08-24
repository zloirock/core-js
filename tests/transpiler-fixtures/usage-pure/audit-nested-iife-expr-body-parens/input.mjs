// the mirrored literal replaces an arrow's WHOLE expression body, which must stay
// parenthesized (block ambiguity); AST printers add the parens automatically
function f({ Array: { from } } = (() => globalThis)()) {
  return from;
}
export { f };
