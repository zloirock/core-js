// a TS enum declared in a block, a function body, a class static block, a switch case or a loop body
// shadows an outer alias of a constructor there: a read in that scope reads the enum, while the alias read
// outside it keeps the constructor's static. the alias declarations load their constructors' families and
// the loop the iteration modules; distinct static per line
const M = Map;
{
  enum M { groupBy = 1 }
  use(M.groupBy);
}
