import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a TS enum declared in a block, a function body, a class static block, a switch case or a loop body
// shadows an outer alias of a constructor there: a read in that scope reads the enum, while the alias read
// outside it keeps the constructor's static. the alias declarations load their constructors' families and
// the loop the iteration modules; distinct static per line
const M = Map;
{
  enum M {
    groupBy = 1,
  }
  use(M.groupBy);
}