// an inner-default AssignmentPattern wrapper (`{x} = {}`) inside an ARRAY param-default destructure is
// transparent: the real receiver is the param default further up, not the `{}` default itself. each
// leaf must still resolve its static off that receiver. distinct methods so each line's import is clear
function fromArr([{ from } = {}] = [Array]) {
  return from;
}
function ofGlobal([{ Array: { of } } = {}] = [globalThis]) {
  return of;
}
