// The parameter-default form of that same fold, which is a different host from the declarator one:
// the [Set] computed key is a bare global this pass substitutes, so per-branch synth spells the
// binding it is rewritten to and both `from` reads get their ponyfill.
const cond = true;
function pick({ from, [Set]: ctor } = cond ? Array : Iterator) {
  return [from, ctor];
}
pick();
