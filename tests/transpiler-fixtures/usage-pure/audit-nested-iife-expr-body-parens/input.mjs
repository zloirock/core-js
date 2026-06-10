// the mirrored literal replaces an arrow's WHOLE expression body: the text emission must
// wrap it in parens (block ambiguity); AST printers add them automatically
function f({ Array: { from } } = (() => globalThis)()) {
  return from;
}
export { f };
