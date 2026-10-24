// per-branch synth-swap with a WKS computed-key sibling: each branch mirrors on its own,
// the plain slot taking that branch's static and the symbol slot the method lookup
// (`_getIteratorMethod(<branch>)` - the one spelling both emitters print for that read
// anywhere else, where a raw `<branch>[_Symbol$iterator]` answers undefined off-engine)
function f({ [Symbol.iterator]: it, from } = cond ? Array : Iterator) {
  return [it, from];
}
export { f };
