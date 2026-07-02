// assignment-pattern in destructure where the value position is a reference to a
// binding: the binding read still routes through pure-mode polyfill rewrites.
const { x = Promise } = obj;
function f(y = Promise) {}
