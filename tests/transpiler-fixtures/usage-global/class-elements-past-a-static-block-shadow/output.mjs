import "core-js/modules/es.symbol.async-iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.get-prototype-of";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// a class static block scopes what it declares - a `var` too, as a function body does - so a method, a field
// initializer, another static block, a static method and a computed key read the global past its `let`, `const`,
// `var`, class, function and destructured names. the block's own read and a closure in it stay on its binding, and
// a second block redeclaring the name, or the block of a class expression redeclaring the class's own name, reads
// its own declaration - its type in a closure and under an early-exit guard too - while an outer user binding still
// covers the method; one family per line so a lost decision shows up in the import set.
class A {
  static {
    let Map = 1;
  }
  m() {
    return new Map();
  }
}
class B {
  static {
    const Set = 1;
  }
  s = new Set([1]);
}
class C {
  static {
    let WeakMap = 1;
  }
  static {
    new WeakMap();
  }
}
class D {
  static {
    var WeakSet = 1;
  }
  static m() {
    return new WeakSet();
  }
}
class E {
  static {
    class Promise {}
  }
  m() {
    return Promise.resolve(1);
  }
}
class F {
  static {
    function Reflect() {}
  }
  m() {
    return Reflect.ownKeys({});
  }
}
class G {
  static {
    let Symbol = 1;
  }
  [Symbol.asyncIterator]() {}
}
class H {
  static {
    const {
      Math
    } = {
      Math: 1
    };
  }
  m() {
    return Math.trunc(1.5);
  }
}
class I {
  static {
    const URL = class {};
    new URL();
  }
}
class J {
  static {
    let AggregateError = class {};
    const make = () => new AggregateError();
    make();
  }
}
class L {
  static {
    const Reflect = 1;
  }
  static {
    function Reflect() {}
    Reflect.apply(null, []);
  }
  m() {
    return Reflect.getPrototypeOf({});
  }
}
const M = class Map {
  static {
    const Map = 'ab';
    Map.at(-1);
  }
};
class N {
  static {
    const s = [1, 2];
  }
  static {
    const s = 'ab';
    const f = () => s.at(-1);
    f();
  }
}
const O = class s {
  static {
    let s = this.value;
    if (typeof s !== 'string') throw 0;
    s.includes('a');
  }
};
const Iterator = class {
  static from() {}
};
class K {
  static {
    let Iterator = 1;
  }
  m() {
    return Iterator.from([]);
  }
}