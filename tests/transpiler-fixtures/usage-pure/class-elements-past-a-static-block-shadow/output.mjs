import _Map from "@core-js/pure/actual/map/constructor";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Reflect$getPrototypeOf from "@core-js/pure/actual/reflect/get-prototype-of";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _Set from "@core-js/pure/actual/set/constructor";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
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
    return new _Map();
  }
}
class B {
  static {
    const Set = 1;
  }
  s = new _Set([1]);
}
class C {
  static {
    let WeakMap = 1;
  }
  static {
    new _WeakMap();
  }
}
class D {
  static {
    var WeakSet = 1;
  }
  static m() {
    return new _WeakSet();
  }
}
class E {
  static {
    class Promise {}
  }
  m() {
    return _Promise$resolve(1);
  }
}
class F {
  static {
    function Reflect() {}
  }
  m() {
    return _Reflect$ownKeys({});
  }
}
class G {
  static {
    let Symbol = 1;
  }
  [_Symbol$asyncIterator]() {}
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
    return _Math$trunc(1.5);
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
    return _Reflect$getPrototypeOf({});
  }
}
const M = class Map {
  static {
    const Map = 'ab';
    _atMaybeString(Map).call(Map, -1);
  }
};
class N {
  static {
    const s = [1, 2];
  }
  static {
    const s = 'ab';
    const f = () => _atMaybeString(s).call(s, -1);
    f();
  }
}
const O = class s {
  static {
    let s = this.value;
    if (typeof s !== 'string') throw 0;
    _includesMaybeString(s).call(s, 'a');
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