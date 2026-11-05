// A literal loop element and an unrelated body receiver retain separate native destructuring reads.
{
  for (const {
    w: {
      keys
    }
  } of [{
    w: Object
  }]) {
    const {
      w: {
        is
      }
    } = _x;
  }
}