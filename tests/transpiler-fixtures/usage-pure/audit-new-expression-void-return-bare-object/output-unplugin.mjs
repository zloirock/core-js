// `new f()` on a function with no return value yields a fresh bare object, so the instance is not
// the call return type and there is no instance narrow - no `.at` polyfill is emitted
function f() {}
(new f()).at(0);