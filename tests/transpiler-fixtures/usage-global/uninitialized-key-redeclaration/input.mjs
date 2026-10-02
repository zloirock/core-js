// A later initialized var declaration supplies the key despite the first empty declaration.
var key;
{
  var key = "from";
}
use(Array[key]);
