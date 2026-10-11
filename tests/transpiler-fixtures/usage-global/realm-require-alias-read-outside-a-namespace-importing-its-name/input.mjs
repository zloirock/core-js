// an alias reads its source where it is declared, so an import alias of the same name in a namespace the
// use stands in does not shadow that read: the alias still holds the global object the require loads
import g = require('core-js/actual/global-this');
const B = g;
namespace N {
  import g = Lib.X;
  use(B.Array.from(xs));
}
