import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.freeze";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.get-own-property-descriptor";
import "core-js/modules/es.object.get-own-property-descriptors";
import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.get-prototype-of";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.is";
import "core-js/modules/es.object.is-extensible";
import "core-js/modules/es.object.is-frozen";
import "core-js/modules/es.object.is-sealed";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.prevent-extensions";
import "core-js/modules/es.object.seal";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.keys";
// an instance reaches its class's statics through `constructor`: where the file reads that key, a class it
// constructs hands its statics on, so a constructor passed to one pairs with nothing and keeps the namespace
// its reads owe
class Kept {
  static keysOf(O, value) {
    return O.keys(value);
  }
}
export const instance = new Kept();
export const owner = instance.constructor;
export const keys = Kept.keysOf(Object, {
  a: 1
});