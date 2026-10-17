import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
// A computed class key observes the earlier constructor write before a static field replaces it.
let early = null;
early = Reflect;
export class Holder {
  static late = (early = Math, 1);
  static [early.ownKeys({}).length] = 2;
}