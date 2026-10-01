import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The returned receiver supplies only from; saving its local function is not a constructor escape.
// Argument mirroring must keep that function's return and its internal name intact.
let saved;
function read([{
  from
} = Array]) {
  return typeof from;
}
read([function source() {
  saved = source;
  return Array;
}()]);
saved() === Array;
read([function Array() {
  return Array;
}()]);