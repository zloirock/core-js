import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
function dfl(a = [1]) {
  return a;
}
const viaDefaultOverridden = dfl(...[[2]]);
viaDefaultOverridden.findLast(Boolean);
viaDefaultOverridden.at(0);
export { viaDefaultOverridden };