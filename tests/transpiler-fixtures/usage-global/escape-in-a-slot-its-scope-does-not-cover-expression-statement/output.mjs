import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Parameter defaults and decorators see the outer scope, before body declarations apply.
// The local identity call retains Map without exposing it; the external decorator exposes Promise.
// An enclosing block still shadows a default's Symbol reference.
function hand(x) {
  return x;
}
function withDefault(x = hand(Map)) {
  var Map = 1;
  return [x, Map];
}
withDefault();