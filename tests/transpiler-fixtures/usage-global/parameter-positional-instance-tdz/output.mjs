import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A getter in a parameter element calls an earlier closure before at is initialized.
// Pure receiver capture must preserve that TDZ throw and the original getter count.
export function read(probe = () => at, [{
  at
}] = [{
  get at() {
    return probe();
  }
}]) {
  return at;
}