import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
class Plain {
  constructor(public other: any) {
    // @ts-expect-error dynamic JS adds a member the declared type lacks
    this.own = new WeakSet();
  }
}
new Plain(1);