// `new f()` discards a primitive return value and yields a fresh bare object, so the
// constructed instance is NOT the function call return type. typing it as the primitive
// return (`string`) used to emit a spurious string-instance `.at` polyfill on an object
// receiver. now the instance is a bare object -> no instance narrow, no polyfill
function f() {
  return "hello";
}
(new f()).at(0);