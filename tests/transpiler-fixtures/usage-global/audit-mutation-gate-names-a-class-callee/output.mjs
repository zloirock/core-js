import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.includes";
// New invokes the class constructor; super invokes the base constructor. Both writes
// must invalidate the later return-type inference without releasing their namespaces.
// Different receivers and instance methods keep the two mutation routes observable.
const xs = [];
const o = {};
class Installer {
  constructor(ctor) {
    ctor.from = patch;
  }
}
new Installer(Array);
Array.from(xs).at(0);
class Base {
  constructor(ns) {
    ns.ownKeys = patch;
  }
}
class Derived extends Base {
  constructor() {
    super(Reflect);
  }
}
new Derived();
Reflect.ownKeys(o).includes(1);