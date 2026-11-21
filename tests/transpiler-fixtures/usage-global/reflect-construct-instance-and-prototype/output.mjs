import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.construct";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
class Target {
  item = [7];
}
class NewTarget {
  get item() {
    return "text";
  }
}
class Methods {
  item() {
    return "target";
  }
}
class Other {
  item() {
    return [9];
  }
}
export const field = Reflect.construct(Target, [], NewTarget).item.at(0);
export const method = Reflect.construct(Methods, ...[[], Other]).item().at(0);