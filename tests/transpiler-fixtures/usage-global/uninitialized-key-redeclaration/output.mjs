import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A later initialized var declaration supplies the key despite the first empty declaration.
var key;
{
  var key = "from";
}
use(Array[key]);