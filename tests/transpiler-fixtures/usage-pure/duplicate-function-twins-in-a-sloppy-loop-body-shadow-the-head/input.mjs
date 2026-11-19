// sloppy code may declare one function name twice in a block: in a loop body redeclaring the head's name
// the last declaration shadows the head there, so the read is the user's function and no static of the
// constructor the head iterates. the loop brings the iteration modules and its element its family
for (const I of [Iterator]) {
  function I() {}
  function I() {}
  use(I.from);
}
