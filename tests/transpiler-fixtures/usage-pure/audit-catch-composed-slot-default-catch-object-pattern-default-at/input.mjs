// the CATCH host is the same question one relocation further: the caught value has no type either,
// and its flat twin already dispatches generically
try {
  risky();
} catch ({ at: caught = 1 }) {
  use(caught);
}
