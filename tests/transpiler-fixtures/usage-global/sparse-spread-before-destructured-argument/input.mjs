function read(flag) {
  return (([{ from }]) => typeof from)([...[flag ? Array : Set, , before()], after()]);
}
use(read);
