import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The constructor is written before the following native subtree's getter runs.
let ctor = 0,
  value;
Object.defineProperty(globalThis, 'mixedCtorProbe', {
  configurable: true,
  value: {
    get x() {
      return typeof ctor;
    }
  }
});
({
  Set: ctor,
  mixedCtorProbe: {
    x: value
  }
} = globalThis);
export const out = [typeof ctor, value];
delete globalThis.mixedCtorProbe;