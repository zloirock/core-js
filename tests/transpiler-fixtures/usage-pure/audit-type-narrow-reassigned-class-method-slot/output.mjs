import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// a class METHOD is a writable slot exactly like a function-valued field: `this.m = ...` puts a
// foreign function in it, and the declared body's return type no longer describes what a call
// yields. narrowing off that body would dispatch a type-specific helper onto the replacement's
// value and throw
class Overwritten {
  rows() {
    return [1, 2];
  }
  swap() {
    this.rows = () => "text";
  }
  read() {
    var _ref;
    return _at(_ref = this.rows()).call(_ref, 0);
  }
}
// the same slot with NO write keeps its narrow - the declaration is all there is
class Intact {
  items() {
    return [3, 4];
  }
  read() {
    var _ref2;
    return _includesMaybeArray(_ref2 = this.items()).call(_ref2, 3);
  }
}
// a STATIC slot is writable through the class binding too, which the this-write index alone
// does not see
class StaticSide {
  static list() {
    return [5, 6];
  }
  static swap() {
    StaticSide.list = () => "text";
  }
  static read() {
    var _ref3;
    return _at(_ref3 = StaticSide.list()).call(_ref3, 1);
  }
}
// an untouched static slot still narrows
class StaticIntact {
  static kept() {
    return [7, 8];
  }
  static read() {
    var _ref4;
    return _includesMaybeArray(_ref4 = StaticIntact.kept()).call(_ref4, 7);
  }
}
// a SUBCLASS writes the inherited slot through its own `this`, which the base body never mentions
class Base {
  rows() {
    return [9, 10];
  }
  read() {
    var _ref5;
    return _at(_ref5 = this.rows()).call(_ref5, 0);
  }
}
class Derived extends Base {
  poison() {
    this.rows = () => "text";
  }
}
// a PRIVATE method has no writable slot at all - nothing can replace it, so it keeps its narrow
class Sealed {
  #rows() {
    return [11, 12];
  }
  read() {
    var _ref6;
    return _includesMaybeArray(_ref6 = this.#rows()).call(_ref6, 11);
  }
}
// an ALIAS of the class binding writes the same static slot; the receiver has to be RESOLVED,
// since aliasing is exactly what makes the binding's name set unenumerable
class Aliased {
  static feed() {
    return [13, 14];
  }
  static read() {
    var _ref7;
    return _at(_ref7 = Aliased.feed()).call(_ref7, 0);
  }
}
const Alias = Aliased;
Alias.feed = () => "text";
// merely HOLDING an alias writes nothing - the slot keeps its narrow
class AliasedIntact {
  static feed() {
    return [15, 16];
  }
  static read() {
    var _ref8;
    return _includesMaybeArray(_ref8 = AliasedIntact.feed()).call(_ref8, 15);
  }
}
const Untouched = AliasedIntact;
export const values = [new Overwritten().read(), new Intact().read(), StaticSide.read(), StaticIntact.read(), new Derived().read(), new Sealed().read(), Aliased.read(), AliasedIntact.read(), Untouched];