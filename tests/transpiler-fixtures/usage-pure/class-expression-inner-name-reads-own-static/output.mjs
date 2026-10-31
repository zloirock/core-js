import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Error$isError from "@core-js/pure/actual/error/is-error";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Math$sumPrecise from "@core-js/pure/actual/math/sum-precise";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _Set from "@core-js/pure/actual/set";
// a class EXPRESSION's inner name (`K1` in `const C1 = class K1 {}`) is bound inside its own body: a
// static read through it takes its polyfill in a static block, a method, a field, a destructure, an
// arrow, parenthesized or as an argument, under any outer binding kind; a write through it keeps the
// read native, and so does a computed key, which evaluates in the inner name's TDZ
const C1 = class K1 {
  static M = _Map;
  static {
    use(_Map$groupBy);
  }
};
const C2 = class K2 {
  static O = Object;
  static f() {
    return _Object$groupBy;
  }
};
const C3 = class K3 {
  static P = _Promise;
  static t = _Promise$try;
};
const C4 = class K4 {
  static I = _Iterator;
  static {
    const f4 = _Iterator$from;
    use(f4);
  }
};
const C5 = (0, class K5 {
  static A = Array;
  static f() {
    return _Array$fromAsync;
  }
});
const C6 = class K6 {
  static E = Error;
  static {
    use(_Error$isError);
  }
};
let C7 = class K7 {
  static P = _Promise;
  static f() {
    return _Promise$withResolvers;
  }
};
var C8 = class K8 {
  static M = Math;
  static {
    const g = () => _Math$sumPrecise;
    use(g);
  }
};
let C9;
C9 = class K9 {
  static O = Object;
  static f() {
    return _Object$fromEntries;
  }
};
const C10 = class K10 {
  static N = Number;
  static {
    K10.N = _Set;
    use(K10.N.isInteger);
  }
};
const C11 = class K11 {
  static A = Array;
  [K11.A.of]() {}
};