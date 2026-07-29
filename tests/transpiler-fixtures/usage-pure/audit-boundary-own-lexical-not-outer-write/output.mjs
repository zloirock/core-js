import _Map from "@core-js/pure/actual/map/constructor";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _Set from "@core-js/pure/actual/set/constructor";
// a nested var-scope boundary shadows the outer name with its OWN lexical declarations, so a write
// inside it is not a write to the outer binding. a `static { }` body holds its statements directly
// (no wrapping block runs the rebind scan over it) and a named function EXPRESSION binds its own
// name inside itself - miss either and the outer binding looks reassigned and loses its narrow
let R = _Reflect;
class WithLet {
  static {
    let R;
    R = Math;
  }
}
const a = _Reflect$ownKeys;
let N = Number;
class WithFn {
  static {
    function N() {}
    N = Math;
  }
}
const b = _Number$parseFloat;
let O = Object;
const named = function O() {
  O = Math;
};
const c = _Object$keys; // control: a write with no shadow between it and the binding IS a real reassignment
let M = _Map;
class Writes {
  static {
    M = _Set;
  }
}
const {
  groupBy: d
} = M;
export { a, b, c, d, WithLet, WithFn, named, Writes };