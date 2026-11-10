import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
{
  var NS = {
    Base: Array
  };
}
class List extends NS.Base {
  static read() {
    return super.from([9]);
  }
}