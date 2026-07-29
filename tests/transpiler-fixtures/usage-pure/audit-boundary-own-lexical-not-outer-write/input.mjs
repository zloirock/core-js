// a nested var-scope boundary shadows the outer name with its OWN lexical declarations, so a write
// inside it is not a write to the outer binding. a `static { }` body holds its statements directly
// (no wrapping block runs the rebind scan over it) and a named function EXPRESSION binds its own
// name inside itself - miss either and the outer binding looks reassigned and loses its narrow
let R = Reflect;
class WithLet { static { let R; R = Math; } }
const { ownKeys: a } = R;
let N = Number;
class WithFn { static { function N() {} N = Math; } }
const { parseFloat: b } = N;
let O = Object;
const named = function O() { O = Math; };
const { keys: c } = O;
// control: a write with no shadow between it and the binding IS a real reassignment
let M = Map;
class Writes { static { M = Set; } }
const { groupBy: d } = M;
export { a, b, c, d, WithLet, WithFn, named, Writes };
