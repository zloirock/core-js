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
// the other two hosts name a CLASS: `new` spells the class while the method it runs is keyed
// `constructor` on both parsers, and `super` names the base through the `extends` clause. the gate
// is coarse per receiver, so the two rows take different ones and read with different methods -
// sharing either would let one row's narrow answer for the other
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